const { body } = require("express-validator");
const { idParam, isObjectId } = require("./common.validation");
const { WORK_MODES, JOB_TYPES, JOB_STATUSES } = require("../models/Job");

const requiredObjectIdBody = (field) =>
  body(field).custom((value) => isObjectId(value)).withMessage(`${field} must be a valid id`);

const optionalObjectIdBody = (field) =>
  body(field).optional().custom((value) => isObjectId(value)).withMessage(`${field} must be a valid id`);

const sharedJobValidation = (optional = false) => {
  const maybe = (chain) => (optional ? chain.optional() : chain);

  return [
    maybe(body("title")).trim().isLength({ min: 2, max: 140 }).withMessage("Title must be between 2 and 140 characters"),
    optional ? optionalObjectIdBody("company") : requiredObjectIdBody("company"),
    body("placementDrive").optional({ nullable: true, checkFalsy: true }).custom(isObjectId).withMessage("placementDrive must be a valid id"),
    maybe(body("location")).trim().notEmpty().withMessage("Location is required").isLength({ max: 160 }).withMessage("Location must not exceed 160 characters"),
    maybe(body("workMode")).isIn(WORK_MODES).withMessage(`Work mode must be one of: ${WORK_MODES.join(", ")}`),
    maybe(body("jobType")).isIn(JOB_TYPES).withMessage(`Job type must be one of: ${JOB_TYPES.join(", ")}`),
    body("salary.min").optional({ nullable: true }).isFloat({ min: 0 }).withMessage("Minimum salary cannot be negative"),
    body("salary.max").optional({ nullable: true }).isFloat({ min: 0 }).withMessage("Maximum salary cannot be negative"),
    body("salary.currency").optional().trim().isLength({ min: 3, max: 3 }).withMessage("Currency must be a 3-letter code"),
    body("salary.period").optional().isIn(["monthly", "yearly", "stipend", "hourly"]).withMessage("Invalid salary period"),
    body("salary.isDisclosed").optional().isBoolean().withMessage("Salary disclosure must be boolean"),
    body("requiredSkills").optional().isArray().withMessage("requiredSkills must be an array"),
    body("requiredSkills.*").optional().custom(isObjectId).withMessage("Each skill must be a valid id"),
    body("eligibility.minCgpa").optional({ nullable: true }).isFloat({ min: 0, max: 10 }).withMessage("CGPA must be between 0 and 10"),
    body("eligibility.allowedBranches").optional().isArray().withMessage("allowedBranches must be an array"),
    body("eligibility.graduationYear").optional().isArray().withMessage("graduationYear must be an array"),
    maybe(body("deadline")).isISO8601().toDate().withMessage("Deadline must be a valid date"),
    body("status").optional().isIn(JOB_STATUSES).withMessage(`Status must be one of: ${JOB_STATUSES.join(", ")}`),
    maybe(body("description")).trim().isLength({ min: 20, max: 5000 }).withMessage("Description must be between 20 and 5000 characters"),
  ];
};

module.exports = {
  createJobValidation: sharedJobValidation(false),
  updateJobValidation: [idParam(), ...sharedJobValidation(true)],
  idValidation: [idParam()],
};
