const dotenv = require("dotenv");

dotenv.config();

const toArray = (value, fallback = []) => {
  if (!value) {
    return fallback;
  }

  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
};

const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT) || 5000,
  mongoUri: process.env.MONGO_URI || "mongodb://127.0.0.1:27017/placement-tracker",
  corsOrigins: toArray(process.env.CORS_ORIGIN, [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5174",
  ]),
  apiPrefix: process.env.API_PREFIX || "/api/v1",
  jwtSecret: process.env.JWT_SECRET || "placement-tracker-local-jwt-secret",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
  jwtCookieExpiresInDays: Number(process.env.JWT_COOKIE_EXPIRES_IN_DAYS) || 7,
};

if (env.nodeEnv === "production" && env.jwtSecret === "placement-tracker-local-jwt-secret") {
  throw new Error("JWT_SECRET must be configured in production");
}

module.exports = env;
