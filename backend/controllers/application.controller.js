const Application = require("../models/Application");
const Job = require("../models/Job");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const asyncHandler = require("../utils/asyncHandler");
const buildQueryFeatures = require("../utils/queryFeatures");

const applicationPopulate = [
  { path: "student", select: "name email role" },
  {
    path: "job",
    select: "title company location workMode jobType deadline status",
    populate: { path: "company", select: "name logo industry" },
  },
  { path: "mentorNotes", select: "mentor note rating visibility createdAt", populate: { path: "mentor", select: "name email" } },
];

const STATUS_TRANSITIONS = {
  applied: ["shortlisted", "rejected", "withdrawn"],
  shortlisted: ["assessment-scheduled", "interview-scheduled", "rejected", "withdrawn"],
  "assessment-scheduled": ["assessment-completed", "rejected", "withdrawn"],
  "assessment-completed": ["interview-scheduled", "rejected", "withdrawn"],
  "interview-scheduled": ["interview-completed", "rejected", "withdrawn"],
  "interview-completed": ["offer-received", "rejected", "withdrawn"],
  "offer-received": ["withdrawn"],
  rejected: [],
  withdrawn: [],
};

const canAccessApplication = (user, application) => {
  if (user.role !== "student") {
    return true;
  }

  const studentId = application.student?._id || application.student;
  return studentId?.toString() === user._id.toString();
};

const assertStatusTransition = (currentStatus, nextStatus) => {
  if (currentStatus === nextStatus) {
    return;
  }

  if (!STATUS_TRANSITIONS[currentStatus]?.includes(nextStatus)) {
    throw new ApiError(400, `Cannot move application from ${currentStatus} to ${nextStatus}`);
  }
};

const getApplicationFilter = (req) => {
  if (req.user.role === "student") {
    return { student: req.user._id };
  }

  return {};
};

const getApplications = asyncHandler(async (req, res) => {
  const { items, meta } = await buildQueryFeatures({
    model: Application,
    query: req.query,
    allowedFilters: ["job", "student", "status"],
    baseFilter: getApplicationFilter(req),
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

  const populatedApplication = await Application.findById(application._id).populate(applicationPopulate);
  res.status(200).json(new ApiResponse(200, populatedApplication, "Application updated successfully"));
});

const updateApplicationStatus = asyncHandler(async (req, res) => {
  const application = await Application.findById(req.params.id);

  if (!application) {
    throw new ApiError(404, "Application not found");
  }

  assertStatusTransition(application.status, req.body.status);

  application.status = req.body.status;
  application.timeline.push({
    status: req.body.status,
    note: req.body.note || "Status updated",
    changedBy: req.user._id,
  });

  await application.save();

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
  createApplication,
  updateApplication,
  updateApplicationStatus,
  withdrawApplication,
  deleteApplication,
};
