const { body } = require("express-validator");
const { idParam, isObjectId } = require("./common.validation");
const { INTERVIEW_TYPES, INTERVIEW_RESULTS, INTERVIEW_MODES } = require("../models/Interview");

const createInterviewValidation = [
  body("application").custom(isObjectId).withMessage("Application must be a valid id"),
  body("date").isISO8601().toDate().withMessage("Date must be valid"),
  body("time").optional().trim().isLength({ max: 20 }).withMessage("Time must not exceed 20 characters"),
  body("type").isIn(INTERVIEW_TYPES).withMessage(`Type must be one of: ${INTERVIEW_TYPES.join(", ")}`),
  body("mode").optional().isIn(INTERVIEW_MODES).withMessage(`Mode must be one of: ${INTERVIEW_MODES.join(", ")}`),
  body("meetingLink").optional().trim().isLength({ max: 500 }).withMessage("Meeting link must not exceed 500 characters"),
  body("interviewerName").optional().trim().isLength({ max: 120 }).withMessage("Interviewer name must not exceed 120 characters"),
  body("round").optional().trim().isLength({ max: 80 }).withMessage("Interview round must not exceed 80 characters"),
  body("instructions").optional().trim().isLength({ max: 2000 }).withMessage("Instructions must not exceed 2000 characters"),
  body("score").optional({ nullable: true }).isFloat({ min: 0, max: 100 }).withMessage("Score must be between 0 and 100"),
  body("feedback").optional().trim().isLength({ max: 3000 }).withMessage("Feedback must not exceed 3000 characters"),
  body("result").optional().isIn(INTERVIEW_RESULTS).withMessage(`Result must be one of: ${INTERVIEW_RESULTS.join(", ")}`),
];

const updateInterviewValidation = [
  idParam(),
  body("date").optional().isISO8601().toDate().withMessage("Date must be valid"),
  body("time").optional().trim().isLength({ max: 20 }).withMessage("Time must not exceed 20 characters"),
  body("type").optional().isIn(INTERVIEW_TYPES).withMessage(`Type must be one of: ${INTERVIEW_TYPES.join(", ")}`),
  body("mode").optional().isIn(INTERVIEW_MODES).withMessage(`Mode must be one of: ${INTERVIEW_MODES.join(", ")}`),
  body("meetingLink").optional().trim().isLength({ max: 500 }).withMessage("Meeting link must not exceed 500 characters"),
  body("interviewerName").optional().trim().isLength({ max: 120 }).withMessage("Interviewer name must not exceed 120 characters"),
  body("round").optional().trim().isLength({ max: 80 }).withMessage("Interview round must not exceed 80 characters"),
  body("instructions").optional().trim().isLength({ max: 2000 }).withMessage("Instructions must not exceed 2000 characters"),
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
