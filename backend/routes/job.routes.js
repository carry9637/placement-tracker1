const express = require("express");
const jobController = require("../controllers/job.controller");
const protect = require("../middleware/auth.middleware");
const authorizeRoles = require("../middleware/role.middleware");
const validateRequest = require("../middleware/validateRequest");
const {
  createJobValidation,
  updateJobValidation,
  idValidation,
} = require("../validations/job.validation");

const router = express.Router();

router.use(protect);

router.get("/", jobController.getJobs);
router.get("/:id", idValidation, validateRequest, jobController.getJobById);
router.post("/", authorizeRoles("admin", "recruiter"), createJobValidation, validateRequest, jobController.createJob);
router.patch("/:id", authorizeRoles("admin", "recruiter"), updateJobValidation, validateRequest, jobController.updateJob);
router.delete("/:id", authorizeRoles("admin"), idValidation, validateRequest, jobController.deleteJob);

module.exports = router;
