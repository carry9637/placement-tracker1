const express = require("express");
const userController = require("../controllers/user.controller");
const protect = require("../middleware/auth.middleware");
const authorizeRoles = require("../middleware/role.middleware");
const validateRequest = require("../middleware/validateRequest");
const { assignMentorValidation, approveRecruiterValidation } = require("../validations/user.validation");

const router = express.Router();

router.use(protect);
router.use(authorizeRoles("admin"));

router.get("/", userController.getUsers);
router.patch("/:studentId/mentor", assignMentorValidation, validateRequest, userController.assignMentor);
router.patch("/:recruiterId/approve-recruiter", approveRecruiterValidation, validateRequest, userController.approveRecruiter);

module.exports = router;
