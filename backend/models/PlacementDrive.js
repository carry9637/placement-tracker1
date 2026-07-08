const mongoose = require("mongoose");

const DRIVE_STATUSES = ["draft", "published", "registration-open", "in-progress", "completed", "closed", "archived"];

const interviewRoundSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Round name is required"],
      trim: true,
      maxlength: [120, "Round name must not exceed 120 characters"],
    },
    order: {
      type: Number,
      min: [1, "Round order must be at least 1"],
      default: 1,
    },
    mode: {
      type: String,
      enum: ["online", "offline", "hybrid"],
      default: "online",
    },
  },
  { _id: false }
);

const placementDriveSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Drive name is required"],
      trim: true,
      minlength: [2, "Drive name must be at least 2 characters"],
      maxlength: [160, "Drive name must not exceed 160 characters"],
      unique: true,
      index: true,
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: [true, "Company is required"],
      index: true,
    },
    eligibility: {
      branches: { type: [String], default: [] },
      minCgpa: { type: Number, min: 0, max: 10, default: null },
      batch: { type: [Number], default: [] },
      notes: { type: String, trim: true, maxlength: 1000, default: "" },
    },
    registrationDeadline: {
      type: Date,
      required: [true, "Registration deadline is required"],
      index: true,
    },
    interviewRounds: {
      type: [interviewRoundSchema],
      default: [],
    },
    status: {
      type: String,
      enum: DRIVE_STATUSES,
      default: "draft",
      index: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

placementDriveSchema.index({ name: "text", "eligibility.branches": "text" });
placementDriveSchema.index({ company: 1, status: 1 });

module.exports = mongoose.model("PlacementDrive", placementDriveSchema);
module.exports.DRIVE_STATUSES = DRIVE_STATUSES;
