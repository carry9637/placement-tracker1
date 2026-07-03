const { validationResult } = require("express-validator");
const ApiError = require("../utils/ApiError");

const validateRequest = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return next(
      new ApiError(
        400,
        "Validation failed",
        errors.array().map((error) => ({
          field: error.path,
          message: error.msg,
        }))
      )
    );
  }

  return next();
};

module.exports = validateRequest;
