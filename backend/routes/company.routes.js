const express = require("express");
const companyController = require("../controllers/company.controller");
const protect = require("../middleware/auth.middleware");
const authorizeRoles = require("../middleware/role.middleware");
const validateRequest = require("../middleware/validateRequest");
const {
  createCompanyValidation,
  updateCompanyValidation,
  idValidation,
} = require("../validations/company.validation");

const router = express.Router();

router.use(protect);
router.use(authorizeRoles("admin"));

router
  .route("/")
  .get(companyController.getCompanies)
  .post(createCompanyValidation, validateRequest, companyController.createCompany);

router
  .route("/:id")
  .get(idValidation, validateRequest, companyController.getCompanyById)
  .patch(updateCompanyValidation, validateRequest, companyController.updateCompany)
  .delete(idValidation, validateRequest, companyController.deleteCompany);

module.exports = router;
