const mongoose = require("mongoose");

const companySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Company name is required"],
      trim: true,
      minlength: [2, "Company name must be at least 2 characters"],
      maxlength: [120, "Company name must not exceed 120 characters"],
      unique: true,
    },
    website: {
      type: String,
      trim: true,
      maxlength: [300, "Website URL must not exceed 300 characters"],
      match: [/^https?:\/\/.+\..+$/i, "Please provide a valid website URL"],
      default: null,
    },
    description: {
      type: String,
      trim: true,
      maxlength: [2000, "Description must not exceed 2000 characters"],
      default: "",
    },
    industry: {
      type: String,
      required: [true, "Industry is required"],
      trim: true,
      maxlength: [100, "Industry must not exceed 100 characters"],
      index: true,
    },
    location: {
      type: String,
      trim: true,
      maxlength: [160, "Location must not exceed 160 characters"],
      default: "",
      index: true,
    },
    logo: {
      type: String,
      trim: true,
      maxlength: [500, "Logo URL must not exceed 500 characters"],
      default: null,
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
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

companySchema.index({ name: "text", industry: "text", location: "text" });

module.exports = mongoose.model("Company", companySchema);
