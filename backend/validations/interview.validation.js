const { body } = require("express-validator");
const { idParam, isObjectId } = require("./common.validation");
const { INTERVIEW_TYPES, INTERVIEW_RESULTS } = require("../models/Interview");

const createInterviewValidation = [
  body("application").custom(isObjectId).withMessage("Application must be a valid id"),
  body("date").isISO8601().toDate().withMessage("Date must be valid"),
  body("type").isIn(INTERVIEW_TYPES).withMessage(`Type must be one of: ${INTERVIEW_TYPES.join(", ")}`),
  body("score").optional({ nullable: true }).isFloat({ min: 0, max: 100 }).withMessage("Score must be between 0 and 100"),
  body("feedback").optional().trim().isLength({ max: 3000 }).withMessage("Feedback must not exceed 3000 characters"),
  body("result").optional().isIn(INTERVIEW_RESULTS).withMessage(`Result must be one of: ${INTERVIEW_RESULTS.join(", ")}`),
];

const updateInterviewValidation = [
  idParam(),
  body("date").optional().isISO8601().toDate().withMessage("Date must be valid"),
  body("type").optional().isIn(INTERVIEW_TYPES).withMessage(`Type must be one of: ${INTERVIEW_TYPES.join(", ")}`),
  body("score").optional({ nullable: true }).isFloat({ min: 0, max: 100 }).withMessage("Score must be between 0 and 100"),
  body("feedback").optional().trim().isLength({ max: 3000 }).withMessage("Feedback must not exceed 3000 characters"),
  body("result").optional().isIn(INTERVIEW_RESULTS).withMessage(`Result must be one of: ${INTERVIEW_RESULTS.join(", ")}`),
];

module.exports = {
  createInterviewValidation,
  updateInterviewValidation,
  feedbackValidation: [
    idParam(),
    body("score").optional({ nullable: true }).isFloat({ min: 0, max: 100 }).withMessage("Score must be between 0 and 100"),
    body("feedback").trim().notEmpty().withMessage("Feedback is required").isLength({ max: 3000 }).withMessage("Feedback must not exceed 3000 characters"),
    body("result").isIn(INTERVIEW_RESULTS).withMessage(`Result must be one of: ${INTERVIEW_RESULTS.join(", ")}`),
  ],
  idValidation: [idParam()],
};
