const express = require("express");
const { body } = require("express-validator");
const multer = require("multer");
const authController = require("../controllers/auth.controller");
const protect = require("../middleware/auth.middleware");

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
    cb(null, allowedTypes.includes(file.mimetype));
  },
});

const registerValidation = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ min: 2, max: 80 })
    .withMessage("Name must be between 2 and 80 characters"),
  body("email").trim().isEmail().withMessage("A valid email is required").normalizeEmail(),
  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters")
    .matches(/[A-Z]/)
    .withMessage("Password must contain at least one uppercase letter")
    .matches(/[a-z]/)
    .withMessage("Password must contain at least one lowercase letter")
    .matches(/[0-9]/)
    .withMessage("Password must contain at least one number"),
];

const loginValidation = [
  body("email").trim().isEmail().withMessage("A valid email is required").normalizeEmail(),
  body("password").notEmpty().withMessage("Password is required"),
];

const updateMeValidation = [
  body("name").optional().trim().isLength({ min: 2, max: 80 }).withMessage("Name must be between 2 and 80 characters"),
  body("profile.phone").optional().trim().isLength({ max: 20 }).withMessage("Phone must not exceed 20 characters"),
  body("profile.headline").optional().trim().isLength({ max: 140 }).withMessage("Headline must not exceed 140 characters"),
  body("profile.location").optional().trim().isLength({ max: 120 }).withMessage("Location must not exceed 120 characters"),
  body("profile.college").optional().trim().isLength({ max: 160 }).withMessage("College must not exceed 160 characters"),
  body("profile.branch").optional().trim().isLength({ max: 120 }).withMessage("Branch must not exceed 120 characters"),
  body("profile.graduationYear").optional({ nullable: true }).isInt({ min: 2000, max: 2100 }).withMessage("Graduation year is invalid"),
  body("profile.cgpa").optional({ nullable: true }).isFloat({ min: 0, max: 10 }).withMessage("CGPA must be between 0 and 10"),
  body("profile.portfolio").optional().trim().isLength({ max: 300 }).withMessage("Portfolio URL must not exceed 300 characters"),
  body("profile.linkedin").optional().trim().isLength({ max: 300 }).withMessage("LinkedIn URL must not exceed 300 characters"),
  body("profile.github").optional().trim().isLength({ max: 300 }).withMessage("GitHub URL must not exceed 300 characters"),
  body("profile.readinessGoal").optional().trim().isLength({ max: 220 }).withMessage("Readiness goal must not exceed 220 characters"),
  body("profile.notifications.email").optional().isBoolean().withMessage("Email notification setting must be boolean"),
  body("profile.notifications.interviews").optional().isBoolean().withMessage("Interview notification setting must be boolean"),
  body("profile.notifications.applications").optional().isBoolean().withMessage("Application notification setting must be boolean"),
];

router.post("/register", registerValidation, authController.register);
router.post("/login", loginValidation, authController.login);
router.get("/me", protect, authController.getMe);
router.patch("/me", protect, updateMeValidation, authController.updateMe);
router.post("/me/resume", protect, upload.single("resume"), authController.uploadResume);
router.post("/logout", authController.logout);

module.exports = router;
