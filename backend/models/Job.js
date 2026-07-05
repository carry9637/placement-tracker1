const mongoose = require("mongoose");

const WORK_MODES = ["remote", "onsite", "hybrid"];
const JOB_TYPES = ["full-time", "part-time", "internship", "contract", "apprenticeship"];
const JOB_STATUSES = ["draft", "open", "closed", "cancelled", "archived"];

const getDeadlineExpiryTime = (deadline) => {
  if (!deadline) {
    return 0;
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

  return deadlineDate.getTime();
};

const salarySchema = new mongoose.Schema(
  {
    min: {
      type: Number,
      min: [0, "Minimum salary cannot be negative"],
      default: null,
    },
    max: {
      type: Number,
      min: [0, "Maximum salary cannot be negative"],
      default: null,
    },
    currency: {
      type: String,
      trim: true,
      uppercase: true,
      minlength: [3, "Currency must be a 3-letter ISO code"],
      maxlength: [3, "Currency must be a 3-letter ISO code"],
      default: "INR",
    },
    period: {
      type: String,
      enum: ["monthly", "yearly", "stipend", "hourly"],
      default: "yearly",
    },
    isDisclosed: {
      type: Boolean,
      default: false,
    },
  },
  { _id: false }
);

const eligibilitySchema = new mongoose.Schema(
  {
    minCgpa: {
      type: Number,
      min: [0, "CGPA cannot be below 0"],
      max: [10, "CGPA cannot exceed 10"],
      default: null,
    },
    allowedBranches: {
      type: [String],
      default: [],
    },
    graduationYear: {
      type: [Number],
      default: [],
    },
    backlogAllowed: {
      type: Boolean,
      default: false,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [1000, "Eligibility notes must not exceed 1000 characters"],
      default: "",
    },
  },
  { _id: false }
);

const jobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Job title is required"],
      trim: true,
      minlength: [2, "Job title must be at least 2 characters"],
      maxlength: [140, "Job title must not exceed 140 characters"],
      index: true,
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: [true, "Company is required"],
      index: true,
    },
    location: {
      type: String,
      required: [true, "Location is required"],
      trim: true,
      maxlength: [160, "Location must not exceed 160 characters"],
      index: true,
    },
    workMode: {
      type: String,
      enum: WORK_MODES,
      required: [true, "Work mode is required"],
      index: true,
    },
    jobType: {
      type: String,
      enum: JOB_TYPES,
      required: [true, "Job type is required"],
      index: true,
    },
    salary: {
      type: salarySchema,
      default: () => ({}),
    },
    requiredSkills: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Skill",
      },
    ],
    eligibility: {
      type: eligibilitySchema,
      default: () => ({}),
    },
    deadline: {
      type: Date,
      required: [true, "Application deadline is required"],
      index: true,
    },
    status: {
      type: String,
      enum: JOB_STATUSES,
      default: "draft",
      index: true,
    },
    description: {
      type: String,
      required: [true, "Job description is required"],
      trim: true,
      minlength: [20, "Job description must be at least 20 characters"],
      maxlength: [5000, "Job description must not exceed 5000 characters"],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

jobSchema.virtual("isExpired").get(function isExpired() {
  return this.deadline ? getDeadlineExpiryTime(this.deadline) < Date.now() : false;
});

jobSchema.virtual("isOpenForApplications").get(function isOpenForApplications() {
  return this.status === "open" && !this.isExpired;
});

jobSchema.path("salary").validate(function validateSalaryRange(value) {
  if (!value || value.min == null || value.max == null) {
    return true;
  }

  return value.max >= value.min;
}, "Maximum salary must be greater than or equal to minimum salary");

jobSchema.index({ status: 1, deadline: 1 });
jobSchema.index({ company: 1, status: 1 });
jobSchema.index({ workMode: 1, jobType: 1, status: 1 });
jobSchema.index({ title: "text", description: "text", location: "text" });

module.exports = mongoose.model("Job", jobSchema);
module.exports.WORK_MODES = WORK_MODES;
module.exports.JOB_TYPES = JOB_TYPES;
module.exports.JOB_STATUSES = JOB_STATUSES;
