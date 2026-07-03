const express = require("express");
const authRoutes = require("./auth.routes");
const applicationRoutes = require("./application.routes");
const companyRoutes = require("./company.routes");
const healthRoutes = require("./health.routes");
const interviewRoutes = require("./interview.routes");
const jobRoutes = require("./job.routes");
const mentorNoteRoutes = require("./mentorNote.routes");
const skillRoutes = require("./skill.routes");

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/companies", companyRoutes);
router.use("/jobs", jobRoutes);
router.use("/applications", applicationRoutes);
router.use("/interviews", interviewRoutes);
router.use("/skills", skillRoutes);
router.use("/mentor-notes", mentorNoteRoutes);
router.use("/health", healthRoutes);

module.exports = router;
