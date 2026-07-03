const express = require("express");
const mentorNoteController = require("../controllers/mentorNote.controller");
const protect = require("../middleware/auth.middleware");
const authorizeRoles = require("../middleware/role.middleware");
const validateRequest = require("../middleware/validateRequest");
const {
  createMentorNoteValidation,
  updateMentorNoteValidation,
  idValidation,
} = require("../validations/mentorNote.validation");

const router = express.Router();

router.use(protect);

router.get("/", mentorNoteController.getMentorNotes);
router.get("/:id", idValidation, validateRequest, mentorNoteController.getMentorNoteById);
router.post("/", authorizeRoles("mentor", "admin"), createMentorNoteValidation, validateRequest, mentorNoteController.createMentorNote);
router.patch("/:id", authorizeRoles("mentor", "admin"), updateMentorNoteValidation, validateRequest, mentorNoteController.updateMentorNote);
router.delete("/:id", authorizeRoles("mentor", "admin"), idValidation, validateRequest, mentorNoteController.deleteMentorNote);

module.exports = router;
