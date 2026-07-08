const { body } = require("express-validator");
const { idParam, isObjectId } = require("./common.validation");
const { DRIVE_STATUSES } = require("../models/PlacementDrive");

const sharedPlacementDriveValidation = (optional = false) => {
  const maybe = (chain) => (optional ? chain.optional() : chain);

  return [
    maybe(body("name")).trim().isLength({ min: 2, max: 160 }).withMessage("Name must be between 2 and 160 characters"),
    maybe(body("company")).custom(isObjectId).withMessage("Company must be a valid id"),
    body("eligibility.branches").optional().isArray().withMessage("Branches must be an array"),
    body("eligibility.minCgpa").optional({ nullable: true }).isFloat({ min: 0, max: 10 }).withMessage("CGPA must be between 0 and 10"),
    body("eligibility.batch").optional().isArray().withMessage("Batch must be an array"),
    body("eligibility.batch.*").optional().isInt({ min: 2000, max: 2100 }).withMessage("Batch year is invalid"),
    body("eligibility.notes").optional().trim().isLength({ max: 1000 }).withMessage("Eligibility notes must not exceed 1000 characters"),
    maybe(body("registrationDeadline")).isISO8601().toDate().withMessage("Registration deadline must be valid"),
    body("interviewRounds").optional().isArray().withMessage("Interview rounds must be an array"),
    body("interviewRounds.*.name").optional().trim().isLength({ min: 2, max: 120 }).withMessage("Round name is invalid"),
    body("interviewRounds.*.order").optional().isInt({ min: 1 }).withMessage("Round order must be at least 1"),
    body("interviewRounds.*.mode").optional().isIn(["online", "offline", "hybrid"]).withMessage("Round mode is invalid"),
    body("status").optional().isIn(DRIVE_STATUSES).withMessage(`Status must be one of: ${DRIVE_STATUSES.join(", ")}`),
  ];
};

module.exports = {
  createPlacementDriveValidation: sharedPlacementDriveValidation(false),
  updatePlacementDriveValidation: [idParam(), ...sharedPlacementDriveValidation(true)],
  idValidation: [idParam()],
};
