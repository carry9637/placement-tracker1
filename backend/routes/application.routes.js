const express = require("express");
const applicationController = require("../controllers/application.controller");
const protect = require("../middleware/auth.middleware");
const authorizeRoles = require("../middleware/role.middleware");
const validateRequest = require("../middleware/validateRequest");
const {
  createApplicationValidation,
  updateApplicationValidation,
  updateStatusValidation,
  idValidation,
} = require("../validations/application.validation");

const router = express.Router();

router.use(protect);

router
  .route("/")
  .get(applicationController.getApplications)
  .post(authorizeRoles("student"), createApplicationValidation, validateRequest, applicationController.createApplication);

router.patch(
  "/:id/status",
  authorizeRoles("student", "mentor", "admin"),
  updateStatusValidation,
  validateRequest,
  applicationController.updateApplicationStatus
);

router.patch(
  "/:id/withdraw",
  authorizeRoles("student"),
  idValidation,
  validateRequest,
  applicationController.withdrawApplication
);

router
  .route("/:id")
  .get(idValidation, validateRequest, applicationController.getApplicationById)
  .patch(authorizeRoles("student"), updateApplicationValidation, validateRequest, applicationController.updateApplication)
  .delete(authorizeRoles("admin"), idValidation, validateRequest, applicationController.deleteApplication);

module.exports = router;
