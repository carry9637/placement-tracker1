const { body } = require("express-validator");
const { idParam, isObjectId } = require("./common.validation");

module.exports = {
  assignMentorValidation: [
    idParam("studentId"),
    body("mentor").custom(isObjectId).withMessage("Mentor must be a valid id"),
  ],
  approveRecruiterValidation: [
    idParam("recruiterId"),
    body("company").custom(isObjectId).withMessage("Company must be a valid id"),
  ],
};
