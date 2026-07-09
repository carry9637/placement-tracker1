const Company = require("../models/Company");
const Job = require("../models/Job");
const PlacementDrive = require("../models/PlacementDrive");
const Skill = require("../models/Skill");
const User = require("../models/User");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const asyncHandler = require("../utils/asyncHandler");
const buildQueryFeatures = require("../utils/queryFeatures");
const recordAuditLog = require("../utils/auditLogger");
const { createNotification } = require("../utils/notificationService");

const jobPopulate = [
  { path: "company", select: "name industry location logo website" },
  { path: "placementDrive", select: "name status registrationDeadline eligibility" },
  { path: "requiredSkills", select: "name category level" },
  { path: "createdBy", select: "name email role" },
];

const normalizeDateOnlyDeadline = (deadline) => {
  if (!deadline) {
    return deadline;
  }

  const deadlineDate = new Date(deadline);
  const isDateOnlyDeadline =
    deadlineDate.getUTCHours() === 0 &&
    deadlineDate.getUTCMinutes() === 0 &&
    deadlineDate.getUTCSeconds() === 0 &&
    deadlineDate.getUTCMilliseconds() === 0;

  if (isDateOnlyDeadline) {
    deadlineDate.setUTCHours(23, 59, 59, 999);
  }

  return deadlineDate;
};

const normalizeJobPayload = (payload) => {
  if (!Object.prototype.hasOwnProperty.call(payload, "deadline")) {
    return payload;
  }

  return {
    ...payload,
    deadline: normalizeDateOnlyDeadline(payload.deadline),
  };
};

const getRecruiterCompanyId = (user) => user.recruiterCompany?._id || user.recruiterCompany;

const assertRecruiterCanManageCompany = (user, companyId) => {
  if (user.role !== "recruiter") {
    return;
  }

  const recruiterCompanyId = getRecruiterCompanyId(user);

  if (!recruiterCompanyId || user.approvalStatus !== "approved") {
    throw new ApiError(403, "Recruiter account must be approved and assigned to a company");
  }

  if (companyId?.toString() !== recruiterCompanyId.toString()) {
    throw new ApiError(403, "Recruiters can only manage their own company's jobs");
  }
};

const getJobBaseFilter = (req) => {
  if (req.user.role === "student") {
    return { status: "open" };
  }

  if (req.user.role === "recruiter") {
    const recruiterCompanyId = getRecruiterCompanyId(req.user);
    return recruiterCompanyId ? { company: recruiterCompanyId } : { _id: null };
  }

  return {};
};

const notifyStudentsAboutPublishedJob = async ({ req, job }) => {
  const students = await User.find({ role: "student", isActive: true }).select("_id");

  await Promise.all(
    students.map((student) =>
      createNotification({
        user: student._id,
        type: "job-published",
        title: "New job published",
        message: `${job.title} is now open for applications.`,
        entityType: "Job",
        entityId: job._id,
        createdBy: req.user._id,
      })
    )
  );
};

const assertJobReferences = async ({ company, placementDrive, requiredSkills = [] }) => {
  if (company) {
    const companyExists = await Company.exists({ _id: company });
    if (!companyExists) {
      throw new ApiError(404, "Company not found");
    }
  }

  if (placementDrive) {
    const driveExists = await PlacementDrive.exists({ _id: placementDrive });
    if (!driveExists) {
      throw new ApiError(404, "Placement drive not found");
    }
  }

  if (requiredSkills.length > 0) {
    const count = await Skill.countDocuments({ _id: { $in: requiredSkills } });
    if (count !== requiredSkills.length) {
      throw new ApiError(400, "One or more required skills are invalid");
    }
  }
};

const getJobs = asyncHandler(async (req, res) => {
  const { items, meta } = await buildQueryFeatures({
    model: Job,
    query: req.query,
    searchableFields: ["title", "description", "location"],
    allowedFilters: ["company", "placementDrive", "location", "workMode", "jobType", "status"],
    baseFilter: getJobBaseFilter(req),
    populate: jobPopulate,
    defaultSort: "deadline",
  });

  res.status(200).json(new ApiResponse(200, items, "Jobs fetched successfully", meta));
});

const getJobById = asyncHandler(async (req, res) => {
  const filter = { _id: req.params.id };
  if (req.user.role === "student") {
    filter.status = "open";
  }
  if (req.user.role === "recruiter") {
    const recruiterCompanyId = getRecruiterCompanyId(req.user);
    filter.company = recruiterCompanyId || null;
  }

  const job = await Job.findOne(filter).populate(jobPopulate);

  if (!job) {
    throw new ApiError(404, "Job not found");
  }

  res.status(200).json(new ApiResponse(200, job, "Job fetched successfully"));
});

const createJob = asyncHandler(async (req, res) => {
  assertRecruiterCanManageCompany(req.user, req.body.company);
  const payload = normalizeJobPayload(req.body);
  await assertJobReferences(payload);

  const job = await Job.create({
    ...payload,
    createdBy: req.user._id,
  });
  await recordAuditLog({ req, action: "job_created", entityType: "Job", entityId: job._id });

  if (job.status === "open") {
    await notifyStudentsAboutPublishedJob({ req, job });
  }

  const populatedJob = await Job.findById(job._id).populate(jobPopulate);
  res.status(201).json(new ApiResponse(201, populatedJob, "Job created successfully"));
});

const updateJob = asyncHandler(async (req, res) => {
  const currentJob = await Job.findById(req.params.id);

  if (!currentJob) {
    throw new ApiError(404, "Job not found");
  }

  assertRecruiterCanManageCompany(req.user, currentJob.company);
  if (req.body.company) {
    assertRecruiterCanManageCompany(req.user, req.body.company);
  }

  const payload = normalizeJobPayload(req.body);
  await assertJobReferences(payload);

  const job = await Job.findByIdAndUpdate(req.params.id, payload, {
    returnDocument: "after",
    runValidators: true,
  }).populate(jobPopulate);
  await recordAuditLog({ req, action: "job_updated", entityType: "Job", entityId: job._id, metadata: { status: job.status } });

  if (currentJob.status !== "open" && job.status === "open") {
    await notifyStudentsAboutPublishedJob({ req, job });
  }

  res.status(200).json(new ApiResponse(200, job, "Job updated successfully"));
});

const deleteJob = asyncHandler(async (req, res) => {
  const job = await Job.findByIdAndDelete(req.params.id);

  if (!job) {
    throw new ApiError(404, "Job not found");
  }

  res.status(200).json(new ApiResponse(200, null, "Job deleted successfully"));
});

module.exports = {
  getJobs,
  getJobById,
  createJob,
  updateJob,
  deleteJob,
};
