const { body } = require("express-validator");
const { idParam, isObjectId } = require("./common.validation");

const createMentorNoteValidation = [
  body("student").custom(isObjectId).withMessage("Student must be a valid id"),
  body("application").optional({ nullable: true }).custom(isObjectId).withMessage("Application must be a valid id"),
  body("note").trim().isLength({ min: 5, max: 3000 }).withMessage("Note must be between 5 and 3000 characters"),
  body("rating").isInt({ min: 1, max: 5 }).withMessage("Rating must be between 1 and 5"),
  body("visibility").optional().isIn(["mentor-only", "student-visible", "admin-visible"]).withMessage("Invalid visibility"),
];

const updateMentorNoteValidation = [
  idParam(),
  body("note").optional().trim().isLength({ min: 5, max: 3000 }).withMessage("Note must be between 5 and 3000 characters"),
  body("rating").optional().isInt({ min: 1, max: 5 }).withMessage("Rating must be between 1 and 5"),
  body("visibility").optional().isIn(["mentor-only", "student-visible", "admin-visible"]).withMessage("Invalid visibility"),
];

module.exports = {
  createMentorNoteValidation,
  updateMentorNoteValidation,
  idValidation: [idParam()],
};
