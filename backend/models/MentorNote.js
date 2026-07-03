const mongoose = require("mongoose");

const mentorNoteSchema = new mongoose.Schema(
  {
    mentor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Mentor is required"],
      index: true,
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Student is required"],
      index: true,
    },
    note: {
      type: String,
      required: [true, "Note is required"],
      trim: true,
      minlength: [5, "Note must be at least 5 characters"],
      maxlength: [3000, "Note must not exceed 3000 characters"],
    },
    rating: {
      type: Number,
      required: [true, "Rating is required"],
      min: [1, "Rating cannot be below 1"],
      max: [5, "Rating cannot exceed 5"],
      index: true,
    },
    application: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Application",
      default: null,
      index: true,
    },
    visibility: {
      type: String,
      enum: ["mentor-only", "student-visible", "admin-visible"],
      default: "admin-visible",
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

mentorNoteSchema.index({ student: 1, createdAt: -1 });
mentorNoteSchema.index({ mentor: 1, createdAt: -1 });
mentorNoteSchema.index({ student: 1, mentor: 1 });

module.exports = mongoose.model("MentorNote", mentorNoteSchema);
