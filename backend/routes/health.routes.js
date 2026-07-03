const express = require("express");
const mongoose = require("mongoose");
const ApiResponse = require("../utils/ApiResponse");
const asyncHandler = require("../utils/asyncHandler");

const router = express.Router();

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const health = {
      service: "placement-tracker-api",
      status: "healthy",
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      database: {
        status: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
      },
    };

    res.status(200).json(new ApiResponse(200, health, "Health check successful"));
  })
);

module.exports = router;
