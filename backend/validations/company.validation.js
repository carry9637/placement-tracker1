const { body } = require("express-validator");
const { idParam } = require("./common.validation");

const createCompanyValidation = [
  body("name").trim().isLength({ min: 2, max: 120 }).withMessage("Name must be between 2 and 120 characters"),
  body("website").optional({ nullable: true, checkFalsy: true }).trim().isURL({ require_protocol: true }).withMessage("Website must be a valid URL"),
  body("description").optional().trim().isLength({ max: 2000 }).withMessage("Description must not exceed 2000 characters"),
  body("industry").trim().notEmpty().withMessage("Industry is required").isLength({ max: 100 }).withMessage("Industry must not exceed 100 characters"),
  body("location").optional().trim().isLength({ max: 160 }).withMessage("Location must not exceed 160 characters"),
  body("logo").optional({ nullable: true, checkFalsy: true }).trim().isURL({ require_protocol: true }).withMessage("Logo must be a valid URL"),
  body("isActive").optional().isBoolean().withMessage("isActive must be boolean"),
];

const updateCompanyValidation = [
  idParam(),
  body("name").optional().trim().isLength({ min: 2, max: 120 }).withMessage("Name must be between 2 and 120 characters"),
  body("website").optional({ nullable: true, checkFalsy: true }).trim().isURL({ require_protocol: true }).withMessage("Website must be a valid URL"),
  body("description").optional().trim().isLength({ max: 2000 }).withMessage("Description must not exceed 2000 characters"),
  body("industry").optional().trim().notEmpty().withMessage("Industry cannot be empty").isLength({ max: 100 }).withMessage("Industry must not exceed 100 characters"),
  body("location").optional().trim().isLength({ max: 160 }).withMessage("Location must not exceed 160 characters"),
  body("logo").optional({ nullable: true, checkFalsy: true }).trim().isURL({ require_protocol: true }).withMessage("Logo must be a valid URL"),
  body("isActive").optional().isBoolean().withMessage("isActive must be boolean"),
];

module.exports = {
  createCompanyValidation,
  updateCompanyValidation,
  idValidation: [idParam()],
};
