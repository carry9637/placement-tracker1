const User = require("../models/User");
const Company = require("../models/Company");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const asyncHandler = require("../utils/asyncHandler");
const buildQueryFeatures = require("../utils/queryFeatures");
const recordAuditLog = require("../utils/auditLogger");
const { createNotification } = require("../utils/notificationService");

const userSelect = "name email role isActive approvalStatus assignedMentor recruiterCompany profile createdAt";
const userPopulate = [
  { path: "assignedMentor", select: "name email role" },
  { path: "recruiterCompany", select: "name industry location" },
];

const getUsers = asyncHandler(async (req, res) => {
  const { items, meta } = await buildQueryFeatures({
    model: User,
    query: req.query,
    searchableFields: ["name", "email"],
    allowedFilters: ["role", "isActive", "approvalStatus", "assignedMentor", "recruiterCompany"],
    populate: userPopulate,
    defaultSort: "-createdAt",
  });

  const safeUsers = items.map((user) => {
    const object = user.toObject ? user.toObject() : user;
    delete object.password;
    return object;
  });

  res.status(200).json(new ApiResponse(200, safeUsers, "Users fetched successfully", meta));
});

const assignMentor = asyncHandler(async (req, res) => {
  const student = await User.findOne({ _id: req.params.studentId, role: "student" });

  if (!student) {
    throw new ApiError(404, "Student not found");
  }

  const mentor = await User.findOne({ _id: req.body.mentor, role: "mentor", isActive: true });

  if (!mentor) {
    throw new ApiError(404, "Mentor not found");
  }

  student.assignedMentor = mentor._id;
  await student.save({ validateBeforeSave: true });
  await recordAuditLog({
    req,
    action: "mentor_assigned",
    entityType: "User",
    entityId: student._id,
    metadata: { mentor: mentor._id },
  });
  await createNotification({
    user: student._id,
    type: "mentor-assigned",
    title: "Mentor assigned",
    message: `${mentor.name} has been assigned as your placement mentor.`,
    entityType: "User",
    entityId: mentor._id,
    createdBy: req.user._id,
  });
  await createNotification({
    user: mentor._id,
    type: "student-assigned",
    title: "Student assigned",
    message: `${student.name} has been assigned to you for placement guidance.`,
    entityType: "User",
    entityId: student._id,
    createdBy: req.user._id,
  });

  const populatedStudent = await User.findById(student._id).select(userSelect).populate(userPopulate);
  res.status(200).json(new ApiResponse(200, populatedStudent, "Mentor assigned successfully"));
});

const approveRecruiter = asyncHandler(async (req, res) => {
  const recruiter = await User.findOne({ _id: req.params.recruiterId, role: "recruiter" });

  if (!recruiter) {
    throw new ApiError(404, "Recruiter not found");
  }

  const company = await Company.findById(req.body.company);

  if (!company) {
    throw new ApiError(404, "Company not found");
  }

  recruiter.recruiterCompany = company._id;
  recruiter.approvalStatus = "approved";
  recruiter.isActive = true;
  await recruiter.save({ validateBeforeSave: true });
  await recordAuditLog({
    req,
    action: "recruiter_approved",
    entityType: "User",
    entityId: recruiter._id,
    metadata: { company: company._id },
  });

  const admins = await User.find({ role: "admin", isActive: true }).select("_id");
  await Promise.all(
    admins.map((admin) =>
      createNotification({
        user: admin._id,
        type: "recruiter-approved",
        title: "Recruiter approved",
        message: `${recruiter.name} has been approved for ${company.name}.`,
        entityType: "User",
        entityId: recruiter._id,
        createdBy: req.user._id,
      })
    )
  );

  const populatedRecruiter = await User.findById(recruiter._id).select(userSelect).populate(userPopulate);
  res.status(200).json(new ApiResponse(200, populatedRecruiter, "Recruiter approved successfully"));
});

module.exports = {
  getUsers,
  assignMentor,
  approveRecruiter,
};
