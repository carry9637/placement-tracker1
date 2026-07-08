const mongoose = require("mongoose");

const APPLICATION_STATUSES = [
  "applied",
  "under-review",
  "mentor-assigned",
  "mentoring-scheduled",
  "mentoring-completed",
  "mentor-recommended",
  "shortlisted",
  "recruiter-review",
  "interview-round-1",
  "interview-round-2",
  "hr-round",
  "selected",
  "offer-released",
  "offer-accepted",
  "offer-declined",
  "assessment-scheduled",
  "assessment-completed",
  "interview-scheduled",
  "interview-completed",
  "offer-received",
  "rejected",
  "withdrawn",
];

const timelineSchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: APPLICATION_STATUSES,
      required: true,
    },
    note: {
      type: String,
      trim: true,
      maxlength: [1000, "Timeline note must not exceed 1000 characters"],
      default: "",
    },
    changedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    changedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const applicationSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Student is required"],
      index: true,
    },
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: [true, "Job is required"],
      index: true,
    },
    status: {
      type: String,
      enum: APPLICATION_STATUSES,
      default: "applied",
      index: true,
    },
    timeline: {
      type: [timelineSchema],
      default: function defaultTimeline() {
        return [
          {
            status: this.status || "applied",
            note: "Application submitted",
            changedAt: new Date(),
          },
        ];
      },
    },
    remarks: {
      type: String,
      trim: true,
      maxlength: [2000, "Remarks must not exceed 2000 characters"],
      default: "",
    },
    mentorNotes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "MentorNote",
      },
    ],
    appliedAt: {
      type: Date,
      default: Date.now,
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

applicationSchema.virtual("latestTimelineEntry").get(function latestTimelineEntry() {
  if (!this.timeline || this.timeline.length === 0) {
    return null;
  }

  return this.timeline[this.timeline.length - 1];
});

applicationSchema.pre("validate", function syncTimelineWithStatus() {
  if (!this.isModified("status")) {
    return;
  }

  const latest = this.timeline?.[this.timeline.length - 1];

  if (!latest || latest.status !== this.status) {
    this.timeline.push({
      status: this.status,
      note: "Status updated",
      changedAt: new Date(),
    });
  }
});

applicationSchema.index({ student: 1, job: 1 }, { unique: true });
applicationSchema.index({ student: 1, status: 1 });
applicationSchema.index({ job: 1, status: 1 });
applicationSchema.index({ status: 1, appliedAt: -1 });

module.exports = mongoose.model("Application", applicationSchema);
module.exports.APPLICATION_STATUSES = APPLICATION_STATUSES;
