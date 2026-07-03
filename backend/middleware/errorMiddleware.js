const ApiError = require("../utils/ApiError");
const env = require("../config/env");

const handleMongooseCastError = (error) =>
  new ApiError(400, `Invalid ${error.path}: ${error.value}`);

const handleMongooseValidationError = (error) => {
  const errors = Object.values(error.errors).map((item) => ({
    field: item.path,
    message: item.message,
  }));

  return new ApiError(400, "Validation failed", errors);
};

const handleDuplicateKeyError = (error) => {
  const fields = Object.keys(error.keyValue || {});
  return new ApiError(409, `Duplicate value for field: ${fields.join(", ")}`);
};

const normalizeError = (error) => {
  if (error instanceof ApiError) {
    return error;
  }

  if (error.name === "CastError") {
    return handleMongooseCastError(error);
  }

  if (error.name === "ValidationError") {
    return handleMongooseValidationError(error);
  }

  if (error.code === 11000) {
    return handleDuplicateKeyError(error);
  }

  return new ApiError(error.statusCode || 500, error.message || "Internal server error", [], error.stack);
};

const errorMiddleware = (error, req, res, next) => {
  const normalizedError = normalizeError(error);
  const statusCode = normalizedError.statusCode || 500;

  if (env.nodeEnv !== "test") {
    console.error(`[${req.method}] ${req.originalUrl} - ${normalizedError.message}`);
  }

  res.status(statusCode).json({
    success: false,
    statusCode,
    message: normalizedError.message,
    errors: normalizedError.errors || [],
    stack: env.nodeEnv === "production" ? undefined : normalizedError.stack,
  });
};

module.exports = errorMiddleware;
