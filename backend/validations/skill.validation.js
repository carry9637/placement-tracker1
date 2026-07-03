const { body } = require("express-validator");
const { idParam } = require("./common.validation");
const { SKILL_CATEGORIES, SKILL_LEVELS } = require("../models/Skill");

const createSkillValidation = [
  body("name").trim().isLength({ min: 2, max: 80 }).withMessage("Name must be between 2 and 80 characters"),
  body("category").optional().isIn(SKILL_CATEGORIES).withMessage(`Category must be one of: ${SKILL_CATEGORIES.join(", ")}`),
  body("level").optional().isIn(SKILL_LEVELS).withMessage(`Level must be one of: ${SKILL_LEVELS.join(", ")}`),
  body("isActive").optional().isBoolean().withMessage("isActive must be boolean"),
];

const updateSkillValidation = [
  idParam(),
  body("name").optional().trim().isLength({ min: 2, max: 80 }).withMessage("Name must be between 2 and 80 characters"),
  body("category").optional().isIn(SKILL_CATEGORIES).withMessage(`Category must be one of: ${SKILL_CATEGORIES.join(", ")}`),
  body("level").optional().isIn(SKILL_LEVELS).withMessage(`Level must be one of: ${SKILL_LEVELS.join(", ")}`),
  body("isActive").optional().isBoolean().withMessage("isActive must be boolean"),
];

module.exports = {
  createSkillValidation,
  updateSkillValidation,
  idValidation: [idParam()],
};
