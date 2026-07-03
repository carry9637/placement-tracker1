const { body } = require("express-validator");
const { idParam, isObjectId } = require("./common.validation");
const { APPLICATION_STATUSES } = require("../models/Application");

const createApplicationValidation = [
  body("job").custom(isObjectId).withMessage("Job must be a valid id"),
  body("remarks").optional().trim().isLength({ max: 2000 }).withMessage("Remarks must not exceed 2000 characters"),
];

const updateStatusValidation = [
  idParam(),
  body("status").isIn(APPLICATION_STATUSES).withMessage(`Status must be one of: ${APPLICATION_STATUSES.join(", ")}`),
  body("note").optional().trim().isLength({ max: 1000 }).withMessage("Note must not exceed 1000 characters"),
];

const updateApplicationValidation = [
  idParam(),
  body("remarks").optional().trim().isLength({ max: 2000 }).withMessage("Remarks must not exceed 2000 characters"),
];

module.exports = {
  createApplicationValidation,
  updateApplicationValidation,
  updateStatusValidation,
  idValidation: [idParam()],
};
