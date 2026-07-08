const Application = require("../models/Application");
const Interview = require("../models/Interview");
const User = require("../models/User");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const asyncHandler = require("../utils/asyncHandler");
const buildQueryFeatures = require("../utils/queryFeatures");
const recordAuditLog = require("../utils/auditLogger");
const { createNotification } = require("../utils/notificationService");

const interviewPopulate = [
  {
    path: "application",
    select: "student job status",
    populate: [
      { path: "student", select: "name email role assignedMentor" },
      { path: "job", select: "title company", populate: { path: "company", select: "name logo" } },
    ],
  },
];

const getStudentApplicationIds = async (studentId) => {
  const applications = await Application.find({ student: studentId }).select("_id");
  return applications.map((application) => application._id);
};

const canAccessInterview = (user, interview) => {
  if (user.role === "admin") {
    return true;
  }

  const studentId = interview.application?.student?._id || interview.application?.student;
  if (user.role === "student") {
    return studentId?.toString() === user._id.toString();
  }

  if (user.role === "mentor") {
    const assignedMentorId = interview.application?.student?.assignedMentor;
    return assignedMentorId?.toString() === user._id.toString();
  }

  if (user.role === "recruiter") {
    const recruiterCompanyId = user.recruiterCompany;
    const companyId = interview.application?.job?.company?._id || interview.application?.job?.company;
    return recruiterCompanyId && companyId?.toString() === recruiterCompanyId.toString();
  }

  return false;
};

const getInterviews = asyncHandler(async (req, res) => {
  const baseFilter = {};

  if (req.user.role === "student") {
    baseFilter.application = { $in: await getStudentApplicationIds(req.user._id) };
  }

  if (req.user.role === "mentor") {
    const students = await User.find({ role: "student", assignedMentor: req.user._id }).select("_id");
    const applications = await Application.find({ student: { $in: students.map((student) => student._id) } }).select("_id");
    baseFilter.application = { $in: applications.map((application) => application._id) };
  }

  if (req.user.role === "recruiter") {
    const applications = await Application.find({ job: { $in: await Application.distinct("job") } })
      .populate({ path: "job", select: "company" })
      .select("_id job");
    baseFilter.application = {
      $in: applications
        .filter((application) => application.job?.company?.toString() === req.user.recruiterCompany?.toString())
        .map((application) => application._id),
    };
  }

  const { items, meta } = await buildQueryFeatures({
    model: Interview,
    query: req.query,
    allowedFilters: ["application", "type", "result"],
    baseFilter,
    populate: interviewPopulate,
    defaultSort: "date",
  });

  res.status(200).json(new ApiResponse(200, items, "Interviews fetched successfully", meta));
});

const getInterviewById = asyncHandler(async (req, res) => {
  const interview = await Interview.findById(req.params.id).populate(interviewPopulate);

  if (!interview || !canAccessInterview(req.user, interview)) {
    throw new ApiError(404, "Interview not found");
  }

  res.status(200).json(new ApiResponse(200, interview, "Interview fetched successfully"));
});

const createInterview = asyncHandler(async (req, res) => {
  const application = await Application.findById(req.body.application);

  if (!application) {
    throw new ApiError(404, "Application not found");
  }

  if (!["shortlisted", "recruiter-review", "interview-round-1", "interview-round-2", "hr-round"].includes(application.status)) {
    throw new ApiError(400, "Interview can only be scheduled after the application is shortlisted or in recruiter review");
  }

  const interview = await Interview.create(req.body);
  await recordAuditLog({
    req,
    action: "interview_scheduled",
    entityType: "Interview",
    entityId: interview._id,
    metadata: { application: application._id, type: interview.type },
  });
  await createNotification({
    user: application.student,
    type: "interview-scheduled",
    title: "Interview scheduled",
    message: "An interview has been scheduled for your application.",
    entityType: "Interview",
    entityId: interview._id,
    createdBy: req.user._id,
  });

  const populatedInterview = await Interview.findById(interview._id).populate(interviewPopulate);
  res.status(201).json(new ApiResponse(201, populatedInterview, "Interview created successfully"));
});

const updateInterview = asyncHandler(async (req, res) => {
  const interview = await Interview.findByIdAndUpdate(req.params.id, req.body, {
    returnDocument: "after",
    runValidators: true,
  }).populate(interviewPopulate);

  if (!interview) {
    throw new ApiError(404, "Interview not found");
  }

  res.status(200).json(new ApiResponse(200, interview, "Interview updated successfully"));
});

const updateInterviewFeedback = asyncHandler(async (req, res) => {
  const interview = await Interview.findById(req.params.id);

  if (!interview) {
    throw new ApiError(404, "Interview not found");
  }

  interview.score = req.body.score ?? interview.score;
  interview.feedback = req.body.feedback;
  interview.result = req.body.result;
  await interview.save();

  const populatedInterview = await Interview.findById(interview._id).populate(interviewPopulate);
  res.status(200).json(new ApiResponse(200, populatedInterview, "Interview feedback updated successfully"));
});

const deleteInterview = asyncHandler(async (req, res) => {
  const interview = await Interview.findByIdAndDelete(req.params.id);

  if (!interview) {
    throw new ApiError(404, "Interview not found");
  }

  res.status(200).json(new ApiResponse(200, null, "Interview deleted successfully"));
});

module.exports = {
  getInterviews,
  getInterviewById,
  createInterview,
  updateInterview,
  updateInterviewFeedback,
  deleteInterview,
};
