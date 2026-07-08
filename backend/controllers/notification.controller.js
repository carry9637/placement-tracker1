const Notification = require("../models/Notification");
const ApiResponse = require("../utils/ApiResponse");
const asyncHandler = require("../utils/asyncHandler");
const buildQueryFeatures = require("../utils/queryFeatures");

const getNotifications = asyncHandler(async (req, res) => {
  const { items, meta } = await buildQueryFeatures({
    model: Notification,
    query: req.query,
    allowedFilters: ["type", "readAt"],
    baseFilter: { user: req.user._id },
    defaultSort: "-createdAt",
  });

  res.status(200).json(new ApiResponse(200, items, "Notifications fetched successfully", meta));
});

module.exports = {
  getNotifications,
};
