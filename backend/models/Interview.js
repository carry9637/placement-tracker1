const mongoose = require("mongoose");

const INTERVIEW_TYPES = ["technical", "hr", "managerial", "aptitude", "group-discussion", "other"];
const INTERVIEW_RESULTS = ["pending", "passed", "failed", "on-hold", "cancelled"];
const INTERVIEW_MODES = ["online", "offline", "hybrid", "phone"];

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
    time: {
      type: String,
      trim: true,
      maxlength: [20, "Interview time must not exceed 20 characters"],
      default: "",
    },
    type: {
      type: String,
      enum: INTERVIEW_TYPES,
      required: [true, "Interview type is required"],
      index: true,
    },
    mode: {
      type: String,
      enum: INTERVIEW_MODES,
      default: "online",
      index: true,
    },
    meetingLink: {
      type: String,
      trim: true,
      maxlength: [500, "Meeting link must not exceed 500 characters"],
      default: "",
    },
    interviewerName: {
      type: String,
      trim: true,
      maxlength: [120, "Interviewer name must not exceed 120 characters"],
      default: "",
    },
    round: {
      type: String,
      trim: true,
      maxlength: [80, "Interview round must not exceed 80 characters"],
      default: "",
    },
    instructions: {
      type: String,
      trim: true,
      maxlength: [2000, "Instructions must not exceed 2000 characters"],
      default: "",
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

interviewSchema.pre("validate", function setInterviewTime() {
  if (!this.time && this.date) {
    this.time = new Intl.DateTimeFormat("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: "Asia/Kolkata",
    }).format(this.date);
  }
});

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
module.exports.INTERVIEW_MODES = INTERVIEW_MODES;
