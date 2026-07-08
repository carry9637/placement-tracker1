const mongoose = require("mongoose");

const NOTIFICATION_TYPES = [
  "job-published",
  "mentor-assigned",
  "session-scheduled",
  "interview-scheduled",
  "offer-released",
  "application-rejected",
  "resume-approved",
  "application-updated",
];

const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User is required"],
      index: true,
    },
    type: {
      type: String,
      enum: NOTIFICATION_TYPES,
      default: "application-updated",
      index: true,
    },
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: [160, "Title must not exceed 160 characters"],
    },
    message: {
      type: String,
      trim: true,
      maxlength: [500, "Message must not exceed 500 characters"],
      default: "",
    },
    entityType: {
      type: String,
      trim: true,
      maxlength: [80, "Entity type must not exceed 80 characters"],
      default: "",
    },
    entityId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    readAt: {
      type: Date,
      default: null,
      index: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

notificationSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model("Notification", notificationSchema);
module.exports.NOTIFICATION_TYPES = NOTIFICATION_TYPES;
