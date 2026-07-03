const mongoose = require("mongoose");

const SKILL_CATEGORIES = [
  "programming",
  "frontend",
  "backend",
  "database",
  "devops",
  "cloud",
  "data",
  "ai-ml",
  "soft-skill",
  "domain",
  "other",
];

const SKILL_LEVELS = ["beginner", "intermediate", "advanced", "expert"];

const skillSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Skill name is required"],
      trim: true,
      minlength: [2, "Skill name must be at least 2 characters"],
      maxlength: [80, "Skill name must not exceed 80 characters"],
    },
    category: {
      type: String,
      enum: SKILL_CATEGORIES,
      default: "other",
      index: true,
    },
    level: {
      type: String,
      enum: SKILL_LEVELS,
      default: "beginner",
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

skillSchema.index({ name: 1, category: 1, level: 1 }, { unique: true });
skillSchema.index({ name: "text", category: "text" });

module.exports = mongoose.model("Skill", skillSchema);
module.exports.SKILL_CATEGORIES = SKILL_CATEGORIES;
module.exports.SKILL_LEVELS = SKILL_LEVELS;
