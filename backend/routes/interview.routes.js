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
router.post("/", authorizeRoles("mentor", "admin"), createInterviewValidation, validateRequest, interviewController.createInterview);
router.patch("/:id", authorizeRoles("mentor", "admin"), updateInterviewValidation, validateRequest, interviewController.updateInterview);
router.patch("/:id/feedback", authorizeRoles("mentor", "admin"), feedbackValidation, validateRequest, interviewController.updateInterviewFeedback);
router.delete("/:id", authorizeRoles("admin"), idValidation, validateRequest, interviewController.deleteInterview);

module.exports = router;
