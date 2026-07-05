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

const addLoopbackOriginAliases = (origins) => {
  const originSet = new Set(origins);

  origins.forEach((origin) => {
    try {
      const parsedOrigin = new URL(origin);

      if (parsedOrigin.hostname === "localhost") {
        parsedOrigin.hostname = "127.0.0.1";
        originSet.add(parsedOrigin.origin);
      } else if (parsedOrigin.hostname === "127.0.0.1") {
        parsedOrigin.hostname = "localhost";
        originSet.add(parsedOrigin.origin);
      }
    } catch (error) {
      // Invalid origins are left as-is so CORS matching remains explicit.
    }
  });

  return Array.from(originSet);
};

const defaultCorsOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:5174",
  "http://127.0.0.1:5174",
  "http://localhost:4173",
  "http://127.0.0.1:4173",
];

const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT) || 5000,
  mongoUri: process.env.MONGO_URI || "mongodb://127.0.0.1:27017/placement-tracker",
  corsOrigins: addLoopbackOriginAliases(toArray(process.env.CORS_ORIGIN, defaultCorsOrigins)),
  apiPrefix: process.env.API_PREFIX || "/api/v1",
  jwtSecret: process.env.JWT_SECRET || "placement-tracker-local-jwt-secret",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
  jwtCookieExpiresInDays: Number(process.env.JWT_COOKIE_EXPIRES_IN_DAYS) || 7,
};

if (env.nodeEnv === "production" && env.jwtSecret === "placement-tracker-local-jwt-secret") {
  throw new Error("JWT_SECRET must be configured in production");
}

module.exports = env;
