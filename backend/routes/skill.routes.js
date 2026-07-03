const express = require("express");
const skillController = require("../controllers/skill.controller");
const protect = require("../middleware/auth.middleware");
const authorizeRoles = require("../middleware/role.middleware");
const validateRequest = require("../middleware/validateRequest");
const {
  createSkillValidation,
  updateSkillValidation,
  idValidation,
} = require("../validations/skill.validation");

const router = express.Router();

router.use(protect);

router.get("/", skillController.getSkills);
router.get("/:id", idValidation, validateRequest, skillController.getSkillById);
router.post("/", authorizeRoles("admin"), createSkillValidation, validateRequest, skillController.createSkill);
router.patch("/:id", authorizeRoles("admin"), updateSkillValidation, validateRequest, skillController.updateSkill);
router.delete("/:id", authorizeRoles("admin"), idValidation, validateRequest, skillController.deleteSkill);

module.exports = router;
