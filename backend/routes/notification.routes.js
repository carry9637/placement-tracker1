const express = require("express");
const notificationController = require("../controllers/notification.controller");
const protect = require("../middleware/auth.middleware");

const router = express.Router();

router.use(protect);

router.get("/", notificationController.getNotifications);

module.exports = router;
