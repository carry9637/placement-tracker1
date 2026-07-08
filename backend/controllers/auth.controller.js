const { validationResult } = require("express-validator");
const multer = require("multer");
const User = require("../models/User");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const asyncHandler = require("../utils/asyncHandler");
const generateToken = require("../utils/generateToken");
const env = require("../config/env");

const cookieOptions = () => ({
  httpOnly: true,
  secure: env.nodeEnv === "production",
  sameSite: env.nodeEnv === "production" ? "none" : "lax",
  maxAge: env.jwtCookieExpiresInDays * 24 * 60 * 60 * 1000,
});

const validateRequest = (req) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    throw new ApiError(
      400,
      "Validation failed",
      errors.array().map((error) => ({
        field: error.path,
        message: error.msg,
      }))
    );
  }
};

const sendAuthResponse = (res, statusCode, user, message) => {
  const token = generateToken(user);

  res.cookie("accessToken", token, cookieOptions());

  return res.status(statusCode).json(
    new ApiResponse(
      statusCode,
      {
        user,
        token,
      },
      message
    )
  );
};

const register = asyncHandler(async (req, res) => {
  validateRequest(req);

  const { name, email, password } = req.body;
  const existingUser = await User.findOne({ email });

  if (existingUser) {
    throw new ApiError(409, "User with this email already exists");
  }

  const user = await User.create({
    name,
    email,
    password,
    role: "student",
  });

  return sendAuthResponse(res, 201, user, "Registration successful");
});

const login = asyncHandler(async (req, res) => {
  validateRequest(req);

  const { email, password } = req.body;
  const user = await User.findOne({ email }).select("+password");

  if (!user || !(await user.comparePassword(password))) {
    throw new ApiError(401, "Invalid email or password");
  }

  if (!user.isActive) {
    throw new ApiError(403, "Account is inactive");
  }

  user.lastLoginAt = new Date();
  await user.save({ validateBeforeSave: false });

  return sendAuthResponse(res, 200, user, "Login successful");
});

const getMe = asyncHandler(async (req, res) => {
  res.status(200).json(new ApiResponse(200, { user: req.user }, "Authenticated user fetched"));
});

const updateMe = asyncHandler(async (req, res) => {
  validateRequest(req);

  const allowedProfileFields = [
    "phone",
    "headline",
    "location",
    "college",
    "branch",
    "graduationYear",
    "cgpa",
    "portfolio",
    "linkedin",
    "github",
    "readinessGoal",
    "notifications",
  ];

  if (req.body.name !== undefined) {
    req.user.name = req.body.name;
  }

  allowedProfileFields.forEach((field) => {
    if (req.body.profile?.[field] !== undefined) {
      req.user.profile[field] = req.body.profile[field];
    }
  });

  await req.user.save({ validateBeforeSave: true });
  res.status(200).json(new ApiResponse(200, { user: req.user }, "Profile updated successfully"));
});

const uploadResume = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new ApiError(400, "Resume file is required");
  }

  req.user.profile.resume = {
    fileName: req.file.originalname,
    mimeType: req.file.mimetype,
    size: req.file.size,
    uploadedAt: new Date(),
  };

  await req.user.save({ validateBeforeSave: true });
  res.status(200).json(new ApiResponse(200, { user: req.user }, "Resume uploaded successfully"));
});

const logout = asyncHandler(async (req, res) => {
  res.clearCookie("accessToken", {
    httpOnly: true,
    secure: env.nodeEnv === "production",
    sameSite: env.nodeEnv === "production" ? "none" : "lax",
  });

  res.status(200).json(new ApiResponse(200, null, "Logout successful"));
});

module.exports = {
  register,
  login,
  getMe,
  updateMe,
  uploadResume,
  logout,
};
