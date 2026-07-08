const express = require("express");
const authRoutes = require("./auth.routes");
const applicationRoutes = require("./application.routes");
const companyRoutes = require("./company.routes");
const healthRoutes = require("./health.routes");
const interviewRoutes = require("./interview.routes");
const jobRoutes = require("./job.routes");
const mentorNoteRoutes = require("./mentorNote.routes");
const notificationRoutes = require("./notification.routes");
const placementDriveRoutes = require("./placementDrive.routes");
const skillRoutes = require("./skill.routes");
const userRoutes = require("./user.routes");

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/companies", companyRoutes);
router.use("/jobs", jobRoutes);
router.use("/applications", applicationRoutes);
router.use("/interviews", interviewRoutes);
router.use("/skills", skillRoutes);
router.use("/users", userRoutes);
router.use("/mentor-notes", mentorNoteRoutes);
router.use("/notifications", notificationRoutes);
router.use("/placement-drives", placementDriveRoutes);
router.use("/health", healthRoutes);

module.exports = router;
