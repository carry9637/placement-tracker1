const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const USER_ROLES = ["student", "mentor", "admin", "recruiter"];

const studentProfileSchema = new mongoose.Schema(
  {
    phone: {
      type: String,
      trim: true,
      maxlength: [20, "Phone must not exceed 20 characters"],
      default: "",
    },
    headline: {
      type: String,
      trim: true,
      maxlength: [140, "Headline must not exceed 140 characters"],
      default: "",
    },
    location: {
      type: String,
      trim: true,
      maxlength: [120, "Location must not exceed 120 characters"],
      default: "",
    },
    college: {
      type: String,
      trim: true,
      maxlength: [160, "College must not exceed 160 characters"],
      default: "",
    },
    branch: {
      type: String,
      trim: true,
      maxlength: [120, "Branch must not exceed 120 characters"],
      default: "",
    },
    graduationYear: {
      type: Number,
      min: [2000, "Graduation year is invalid"],
      max: [2100, "Graduation year is invalid"],
      default: null,
    },
    cgpa: {
      type: Number,
      min: [0, "CGPA cannot be below 0"],
      max: [10, "CGPA cannot exceed 10"],
      default: null,
    },
    portfolio: {
      type: String,
      trim: true,
      maxlength: [300, "Portfolio URL must not exceed 300 characters"],
      default: "",
    },
    linkedin: {
      type: String,
      trim: true,
      maxlength: [300, "LinkedIn URL must not exceed 300 characters"],
      default: "",
    },
    github: {
      type: String,
      trim: true,
      maxlength: [300, "GitHub URL must not exceed 300 characters"],
      default: "",
    },
    readinessGoal: {
      type: String,
      trim: true,
      maxlength: [220, "Readiness goal must not exceed 220 characters"],
      default: "",
    },
    resume: {
      fileName: {
        type: String,
        trim: true,
        default: "",
      },
      mimeType: {
        type: String,
        trim: true,
        default: "",
      },
      size: {
        type: Number,
        default: 0,
      },
      uploadedAt: {
        type: Date,
        default: null,
      },
      data: {
        type: Buffer,
        select: false,
        default: undefined,
      },
    },
    notifications: {
      email: {
        type: Boolean,
        default: true,
      },
      interviews: {
        type: Boolean,
        default: true,
      },
      applications: {
        type: Boolean,
        default: true,
      },
    },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [80, "Name must not exceed 80 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email"],
      index: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters"],
      select: false,
    },
    role: {
      type: String,
      enum: USER_ROLES,
      default: "student",
      index: true,
    },
    assignedMentor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },
    recruiterCompany: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      default: null,
      index: true,
    },
    approvalStatus: {
      type: String,
      enum: ["approved", "pending", "rejected"],
      default: "approved",
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLoginAt: {
      type: Date,
      default: null,
    },
    passwordChangedAt: {
      type: Date,
      default: null,
    },
    profile: {
      type: studentProfileSchema,
      default: () => ({}),
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

userSchema.pre("save", async function hashPassword() {
  if (!this.isModified("password")) {
    return;
  }

  this.password = await bcrypt.hash(this.password, 12);

  if (!this.isNew) {
    this.passwordChangedAt = new Date();
  }
});

userSchema.methods.comparePassword = function comparePassword(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.toJSON = function toJSON() {
  const user = this.toObject();
  delete user.password;
  return user;
};

module.exports = mongoose.model("User", userSchema);
module.exports.USER_ROLES = USER_ROLES;
