const express = require("express");
const placementDriveController = require("../controllers/placementDrive.controller");
const protect = require("../middleware/auth.middleware");
const authorizeRoles = require("../middleware/role.middleware");
const validateRequest = require("../middleware/validateRequest");
const {
  createPlacementDriveValidation,
  updatePlacementDriveValidation,
} = require("../validations/placementDrive.validation");

const router = express.Router();

router.use(protect);

router.get("/", placementDriveController.getPlacementDrives);
router.post("/", authorizeRoles("admin"), createPlacementDriveValidation, validateRequest, placementDriveController.createPlacementDrive);
router.patch("/:id", authorizeRoles("admin"), updatePlacementDriveValidation, validateRequest, placementDriveController.updatePlacementDrive);

module.exports = router;
