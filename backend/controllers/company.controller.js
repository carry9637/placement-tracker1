const Company = require("../models/Company");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const asyncHandler = require("../utils/asyncHandler");
const buildQueryFeatures = require("../utils/queryFeatures");

const getCompanies = asyncHandler(async (req, res) => {
  const { items, meta } = await buildQueryFeatures({
    model: Company,
    query: req.query,
    searchableFields: ["name", "industry", "location"],
    allowedFilters: ["industry", "location", "isActive"],
  });

  res.status(200).json(new ApiResponse(200, items, "Companies fetched successfully", meta));
});

const getCompanyById = asyncHandler(async (req, res) => {
  const company = await Company.findById(req.params.id);

  if (!company) {
    throw new ApiError(404, "Company not found");
  }

  res.status(200).json(new ApiResponse(200, company, "Company fetched successfully"));
});

const createCompany = asyncHandler(async (req, res) => {
  const company = await Company.create(req.body);
  res.status(201).json(new ApiResponse(201, company, "Company created successfully"));
});

const updateCompany = asyncHandler(async (req, res) => {
  const company = await Company.findByIdAndUpdate(req.params.id, req.body, {
    returnDocument: "after",
    runValidators: true,
  });

  if (!company) {
    throw new ApiError(404, "Company not found");
  }

  res.status(200).json(new ApiResponse(200, company, "Company updated successfully"));
});

const deleteCompany = asyncHandler(async (req, res) => {
  const company = await Company.findByIdAndDelete(req.params.id);

  if (!company) {
    throw new ApiError(404, "Company not found");
  }

  res.status(200).json(new ApiResponse(200, null, "Company deleted successfully"));
});

module.exports = {
  getCompanies,
  getCompanyById,
  createCompany,
  updateCompany,
  deleteCompany,
};
