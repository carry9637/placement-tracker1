const express = require("express");
const interviewController = require("../controllers/interview.controller");
const protect = require("../middleware/auth.middleware");
const authorizeRoles = require("../middleware/role.middleware");
const validateRequest = require("../middleware/validateRequest");
const {
  createInterviewValidation,
  updateInterviewValidation,
  feedbackValidation,
  idValidation,
} = require("../validations/interview.validation");

const router = express.Router();

router.use(protect);

router.get("/", interviewController.getInterviews);
router.get("/:id", idValidation, validateRequest, interviewController.getInterviewById);
router.post("/", authorizeRoles("recruiter"), createInterviewValidation, validateRequest, interviewController.createInterview);
router.patch("/:id", authorizeRoles("recruiter"), updateInterviewValidation, validateRequest, interviewController.updateInterview);
router.patch("/:id/feedback", authorizeRoles("recruiter"), feedbackValidation, validateRequest, interviewController.updateInterviewFeedback);

module.exports = router;
