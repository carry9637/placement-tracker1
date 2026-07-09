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
router.post("/", authorizeRoles("admin", "recruiter"), createInterviewValidation, validateRequest, interviewController.createInterview);
router.patch("/:id", authorizeRoles("admin", "recruiter"), updateInterviewValidation, validateRequest, interviewController.updateInterview);
router.patch("/:id/feedback", authorizeRoles("admin", "recruiter"), feedbackValidation, validateRequest, interviewController.updateInterviewFeedback);
router.delete("/:id", authorizeRoles("admin"), idValidation, validateRequest, interviewController.deleteInterview);

module.exports = router;
