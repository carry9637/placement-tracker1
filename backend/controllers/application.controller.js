const Application = require("../models/Application");
const Job = require("../models/Job");
const User = require("../models/User");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const asyncHandler = require("../utils/asyncHandler");
const buildQueryFeatures = require("../utils/queryFeatures");
const recordAuditLog = require("../utils/auditLogger");
const { createNotification } = require("../utils/notificationService");

const applicationPopulate = [
  { path: "student", select: "name email role profile assignedMentor" },
  {
    path: "job",
    select: "title company location workMode jobType deadline status requiredSkills",
    populate: [
      { path: "company", select: "name logo industry" },
      { path: "requiredSkills", select: "name category level" },
    ],
  },
  { path: "mentorNotes", select: "mentor note rating visibility createdAt", populate: { path: "mentor", select: "name email" } },
];

const STATUS_TRANSITIONS = {
  applied: ["under-review", "withdrawn"],
  "under-review": ["mentor-assigned", "shortlisted", "rejected", "withdrawn"],
  "mentor-assigned": ["mentoring-scheduled", "shortlisted", "rejected", "withdrawn"],
  "mentoring-scheduled": ["mentoring-completed", "rejected", "withdrawn"],
  "mentoring-completed": ["mentor-recommended", "shortlisted", "rejected", "withdrawn"],
  "mentor-recommended": ["shortlisted", "rejected", "withdrawn"],
  shortlisted: ["recruiter-review", "assessment-scheduled", "interview-scheduled", "rejected", "withdrawn"],
  "recruiter-review": ["interview-round-1", "rejected", "withdrawn"],
  "interview-round-1": ["interview-round-2", "hr-round", "selected", "rejected", "withdrawn"],
  "interview-round-2": ["hr-round", "selected", "rejected", "withdrawn"],
  "hr-round": ["selected", "rejected", "withdrawn"],
  selected: ["offer-released", "rejected", "withdrawn"],
  "offer-released": ["offer-accepted", "offer-declined"],
  "offer-accepted": [],
  "offer-declined": [],
  "assessment-scheduled": ["assessment-completed", "rejected", "withdrawn"],
  "assessment-completed": ["interview-scheduled", "offer-received", "rejected", "withdrawn"],
  "interview-scheduled": ["interview-completed", "offer-received", "rejected", "withdrawn"],
  "interview-completed": ["offer-received", "rejected", "withdrawn"],
  "offer-received": ["withdrawn"],
  rejected: [],
  withdrawn: [],
};

const MENTOR_ALLOWED_STATUSES = ["mentoring-scheduled", "mentoring-completed", "mentor-recommended"];
const ADMIN_ALLOWED_STATUSES = ["under-review", "mentor-assigned", "shortlisted", "recruiter-review", "rejected"];
const ADMIN_REJECTABLE_STATUSES = [
  "applied",
  "under-review",
  "mentor-assigned",
  "mentoring-scheduled",
  "mentoring-completed",
  "mentor-recommended",
  "shortlisted",
];
const RECRUITER_ALLOWED_STATUSES = ["interview-round-1", "interview-round-2", "hr-round", "selected", "offer-released", "rejected"];
const STUDENT_ALLOWED_STATUSES = ["offer-accepted", "offer-declined"];

const statusNotificationMap = {
  "mentor-assigned": {
    type: "mentor-assigned",
    title: "Mentor assigned",
    message: "A mentor has been assigned to guide this application.",
  },
  "mentoring-scheduled": {
    type: "session-scheduled",
    title: "Mentoring session scheduled",
    message: "A mentoring session has been scheduled for your placement journey.",
  },
  "interview-scheduled": {
    type: "interview-scheduled",
    title: "Interview scheduled",
    message: "An interview has been scheduled for your application.",
  },
  "interview-round-1": {
    type: "interview-scheduled",
    title: "Interview round 1",
    message: "Your first interview round has been scheduled or started.",
  },
  "interview-round-2": {
    type: "interview-scheduled",
    title: "Interview round 2",
    message: "Your second interview round has been scheduled or started.",
  },
  "hr-round": {
    type: "interview-scheduled",
    title: "HR round",
    message: "Your HR round has been scheduled or started.",
  },
  "offer-released": {
    type: "offer-released",
    title: "Offer released",
    message: "An offer has been released for your application.",
  },
  "offer-accepted": {
    type: "offer-accepted",
    title: "Offer accepted",
    message: "Your offer response has been recorded as accepted.",
  },
  "offer-declined": {
    type: "offer-declined",
    title: "Offer declined",
    message: "Your offer response has been recorded as declined.",
  },
  "offer-received": {
    type: "offer-released",
    title: "Offer received",
    message: "An offer has been received for your application.",
  },
  rejected: {
    type: "application-rejected",
    title: "Application rejected",
    message: "Your application has been marked rejected.",
  },
};

const statusAuditActionMap = {
  "mentor-assigned": "mentor_assigned",
  "mentoring-scheduled": "mentoring_session_scheduled",
  "interview-scheduled": "interview_scheduled",
  "interview-round-1": "interview_round_1_started",
  "interview-round-2": "interview_round_2_started",
  "hr-round": "hr_round_started",
  selected: "candidate_selected",
  "offer-released": "offer_released",
  rejected: "application_rejected",
};

const notifyStatusChange = async ({ req, application, status }) => {
  const notification = statusNotificationMap[status];
  const studentId = application.student?._id || application.student;

  if (notification && studentId) {
    await createNotification({
      user: studentId,
      ...notification,
      entityType: "Application",
      entityId: application._id,
      createdBy: req.user._id,
    });
  }

  const companyId = application.job?.company?._id || application.job?.company;
  if (status === "offer-accepted" && companyId) {
    const recruiters = await User.find({ role: "recruiter", recruiterCompany: companyId, isActive: true }).select("_id");
    await Promise.all(
      recruiters.map((recruiter) =>
        createNotification({
          user: recruiter._id,
          type: "student-accepted-offer",
          title: "Student accepted offer",
          message: "A student has accepted your released offer.",
          entityType: "Application",
          entityId: application._id,
          createdBy: req.user._id,
        })
      )
    );
  }

  const assignedMentorId = application.student?.assignedMentor;
  if (status === "mentoring-scheduled" && assignedMentorId) {
    await createNotification({
      user: assignedMentorId,
      type: "session-scheduled",
      title: "Session scheduled",
      message: "A mentoring session has been scheduled for an assigned student.",
      entityType: "Application",
      entityId: application._id,
      createdBy: req.user._id,
    });
  }
};

const canAccessApplication = (user, application) => {
  if (user.role === "admin") {
    return true;
  }

  const studentId = application.student?._id || application.student;
  if (user.role === "student") {
    return studentId?.toString() === user._id.toString();
  }

  if (user.role === "mentor") {
    const assignedMentorId = application.student?.assignedMentor;
    return assignedMentorId?.toString() === user._id.toString();
  }

  if (user.role === "recruiter") {
    const recruiterCompanyId = user.recruiterCompany;
    const applicationCompanyId = application.job?.company?._id || application.job?.company;
    return recruiterCompanyId && applicationCompanyId?.toString() === recruiterCompanyId.toString();
  }

  return false;
};

const assertStatusTransition = (currentStatus, nextStatus) => {
  if (currentStatus === nextStatus) {
    return;
  }

  if (!STATUS_TRANSITIONS[currentStatus]?.includes(nextStatus)) {
    throw new ApiError(400, `Cannot move application from ${currentStatus} to ${nextStatus}`);
  }
};

const assertRoleCanSetStatus = (req, application, nextStatus) => {
  if (req.user.role === "admin") {
    if (!ADMIN_ALLOWED_STATUSES.includes(nextStatus)) {
      throw new ApiError(403, "Admins can only screen, assign mentors, shortlist, reject before interview, or forward to recruiter");
    }

    if (nextStatus === "rejected" && !ADMIN_REJECTABLE_STATUSES.includes(application.status)) {
      throw new ApiError(403, "Admins cannot reject candidates after recruiter interview workflow has started");
    }

    return;
  }

  if (req.user.role === "student") {
    const studentId = application.student?._id || application.student;
    if (studentId?.toString() !== req.user._id.toString() || !STUDENT_ALLOWED_STATUSES.includes(nextStatus)) {
      throw new ApiError(403, "Students can only accept or decline their own released offers");
    }

    if (application.status !== "offer-released") {
      throw new ApiError(400, "Offer response is only available after an offer is released");
    }

    return;
  }

  if (req.user.role === "mentor") {
    if (!canAccessApplication(req.user, application)) {
      throw new ApiError(403, "Mentors can only update assigned student guidance workflows");
    }

    if (!MENTOR_ALLOWED_STATUSES.includes(nextStatus)) {
      throw new ApiError(403, "Mentors can only schedule mentoring, complete mentoring, or recommend a student");
    }

    return;
  }

  if (req.user.role === "recruiter") {
    if (!canAccessApplication(req.user, application)) {
      throw new ApiError(403, "Recruiters can only update applications for their own company");
    }

    if (!RECRUITER_ALLOWED_STATUSES.includes(nextStatus)) {
      throw new ApiError(403, "Recruiters can only manage company interview, selection, rejection, and offer stages");
    }

    return;
  }

  throw new ApiError(403, "You do not have permission to update this application status");
};

const getApplicationFilter = async (req) => {
  if (req.user.role === "student") {
    return { student: req.user._id };
  }

  if (req.user.role === "mentor") {
    const students = await User.find({ role: "student", assignedMentor: req.user._id }).select("_id");
    return { student: { $in: students.map((student) => student._id) } };
  }

  if (req.user.role === "recruiter") {
    const jobs = await Job.find({ company: req.user.recruiterCompany }).select("_id");
    return { job: { $in: jobs.map((job) => job._id) } };
  }

  return {};
};

const getApplications = asyncHandler(async (req, res) => {
  const { items, meta } = await buildQueryFeatures({
    model: Application,
    query: req.query,
    allowedFilters: ["job", "student", "status"],
    baseFilter: await getApplicationFilter(req),
    populate: applicationPopulate,
  });

  res.status(200).json(new ApiResponse(200, items, "Applications fetched successfully", meta));
});

const getApplicationById = asyncHandler(async (req, res) => {
  const application = await Application.findById(req.params.id).populate(applicationPopulate);

  if (!application || !canAccessApplication(req.user, application)) {
    throw new ApiError(404, "Application not found");
  }

  res.status(200).json(new ApiResponse(200, application, "Application fetched successfully"));
});

const getApplicationResume = asyncHandler(async (req, res) => {
  const application = await Application.findById(req.params.id).populate([
    { path: "student", select: "name profile" },
    { path: "job", select: "company" },
  ]);

  if (!application || !canAccessApplication(req.user, application)) {
    throw new ApiError(404, "Application not found");
  }

  const studentId = application.student?._id || application.student;
  const student = await User.findById(studentId).select("+profile.resume.data profile.resume name");
  const resume = student?.profile?.resume;

  if (!resume?.fileName) {
    throw new ApiError(404, "Resume not uploaded");
  }

  if (!resume.data?.length) {
    throw new ApiError(404, "Resume file content is unavailable for this upload");
  }

  const disposition = req.query.download === "true" || req.query.download === "1" ? "attachment" : "inline";
  res.setHeader("Content-Type", resume.mimeType || "application/octet-stream");
  res.setHeader("Content-Length", resume.data.length);
  res.setHeader("Content-Disposition", `${disposition}; filename="${encodeURIComponent(resume.fileName)}"`);
  res.send(resume.data);
});

const createApplication = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.body.job);

  if (!job || job.status !== "open" || job.isExpired) {
    throw new ApiError(400, "Job is not open for applications");
  }

  const existingApplication = await Application.findOne({
    student: req.user._id,
    job: job._id,
  });

  if (existingApplication) {
    throw new ApiError(409, "You have already applied for this job");
  }

  const application = await Application.create({
    student: req.user._id,
    job: job._id,
    remarks: req.body.remarks,
    timeline: [
      {
        status: "applied",
        note: "Application submitted",
        changedBy: req.user._id,
      },
    ],
  });

  const recruiters = await User.find({ role: "recruiter", recruiterCompany: job.company, isActive: true }).select("_id");
  await Promise.all(
    recruiters.map((recruiter) =>
      createNotification({
        user: recruiter._id,
        type: "new-application",
        title: "New application",
        message: "A student has applied to one of your jobs.",
        entityType: "Application",
        entityId: application._id,
        createdBy: req.user._id,
      })
    )
  );

  const populatedApplication = await Application.findById(application._id).populate(applicationPopulate);
  res.status(201).json(new ApiResponse(201, populatedApplication, "Application submitted successfully"));
});

const updateApplication = asyncHandler(async (req, res) => {
  const application = await Application.findById(req.params.id);

  if (!application || !canAccessApplication(req.user, application)) {
    throw new ApiError(404, "Application not found");
  }

  if (application.status === "withdrawn" || application.status === "rejected") {
    throw new ApiError(400, "Closed applications cannot be updated");
  }

  application.remarks = req.body.remarks ?? application.remarks;
  await application.save();
  await recordAuditLog({
    req,
    action: "student_applied",
    entityType: "Application",
    entityId: application._id,
    metadata: { job: job._id },
  });

  const populatedApplication = await Application.findById(application._id).populate(applicationPopulate);
  res.status(200).json(new ApiResponse(200, populatedApplication, "Application updated successfully"));
});

const updateApplicationStatus = asyncHandler(async (req, res) => {
  const application = await Application.findById(req.params.id).populate([
    { path: "student", select: "assignedMentor role" },
    { path: "job", select: "company" },
  ]);

  if (!application) {
    throw new ApiError(404, "Application not found");
  }

  assertStatusTransition(application.status, req.body.status);
  assertRoleCanSetStatus(req, application, req.body.status);

  application.status = req.body.status;
  application.timeline.push({
    status: req.body.status,
    note: req.body.note || "Status updated",
    changedBy: req.user._id,
  });

  await application.save();
  await recordAuditLog({
    req,
    action: statusAuditActionMap[req.body.status] || "application_status_updated",
    entityType: "Application",
    entityId: application._id,
    metadata: { status: req.body.status },
  });
  await notifyStatusChange({ req, application, status: req.body.status });

  const populatedApplication = await Application.findById(application._id).populate(applicationPopulate);
  res.status(200).json(new ApiResponse(200, populatedApplication, "Application status updated successfully"));
});

const withdrawApplication = asyncHandler(async (req, res) => {
  const application = await Application.findById(req.params.id);

  if (!application || !canAccessApplication(req.user, application)) {
    throw new ApiError(404, "Application not found");
  }

  assertStatusTransition(application.status, "withdrawn");

  application.status = "withdrawn";
  application.timeline.push({
    status: "withdrawn",
    note: req.body.note || "Application withdrawn",
    changedBy: req.user._id,
  });

  await application.save();

  const populatedApplication = await Application.findById(application._id).populate(applicationPopulate);
  res.status(200).json(new ApiResponse(200, populatedApplication, "Application withdrawn successfully"));
});

const deleteApplication = asyncHandler(async (req, res) => {
  const application = await Application.findByIdAndDelete(req.params.id);

  if (!application) {
    throw new ApiError(404, "Application not found");
  }

  res.status(200).json(new ApiResponse(200, null, "Application deleted successfully"));
});

module.exports = {
  getApplications,
  getApplicationById,
  getApplicationResume,
  createApplication,
  updateApplication,
  updateApplicationStatus,
  withdrawApplication,
  deleteApplication,
};
