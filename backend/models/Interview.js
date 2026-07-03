const mongoose = require("mongoose");

const INTERVIEW_TYPES = ["technical", "hr", "managerial", "aptitude", "group-discussion", "other"];
const INTERVIEW_RESULTS = ["pending", "passed", "failed", "on-hold", "cancelled"];

const interviewSchema = new mongoose.Schema(
  {
    application: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Application",
      required: [true, "Application is required"],
      index: true,
    },
    date: {
      type: Date,
      required: [true, "Interview date is required"],
      index: true,
    },
    type: {
      type: String,
      enum: INTERVIEW_TYPES,
      required: [true, "Interview type is required"],
      index: true,
    },
    score: {
      type: Number,
      min: [0, "Score cannot be below 0"],
      max: [100, "Score cannot exceed 100"],
      default: null,
    },
    feedback: {
      type: String,
      trim: true,
      maxlength: [3000, "Feedback must not exceed 3000 characters"],
      default: "",
    },
    result: {
      type: String,
      enum: INTERVIEW_RESULTS,
      default: "pending",
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

interviewSchema.virtual("isCompleted").get(function isCompleted() {
  return ["passed", "failed", "on-hold"].includes(this.result);
});

interviewSchema.virtual("isUpcoming").get(function isUpcoming() {
  return this.result === "pending" && this.date && this.date.getTime() > Date.now();
});

interviewSchema.index({ application: 1, type: 1, date: 1 });
interviewSchema.index({ date: 1, result: 1 });

module.exports = mongoose.model("Interview", interviewSchema);
module.exports.INTERVIEW_TYPES = INTERVIEW_TYPES;
module.exports.INTERVIEW_RESULTS = INTERVIEW_RESULTS;
