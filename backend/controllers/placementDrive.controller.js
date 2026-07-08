const Company = require("../models/Company");
const PlacementDrive = require("../models/PlacementDrive");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const asyncHandler = require("../utils/asyncHandler");
const buildQueryFeatures = require("../utils/queryFeatures");
const recordAuditLog = require("../utils/auditLogger");

const drivePopulate = [{ path: "company", select: "name industry location logo" }];

const assertCompanyExists = async (companyId) => {
  const company = await Company.exists({ _id: companyId });
  if (!company) {
    throw new ApiError(404, "Company not found");
  }
};

const getPlacementDrives = asyncHandler(async (req, res) => {
  const { items, meta } = await buildQueryFeatures({
    model: PlacementDrive,
    query: req.query,
    searchableFields: ["name", "eligibility.branches"],
    allowedFilters: ["company", "status"],
    populate: drivePopulate,
    defaultSort: "-createdAt",
  });

  res.status(200).json(new ApiResponse(200, items, "Placement drives fetched successfully", meta));
});

const createPlacementDrive = asyncHandler(async (req, res) => {
  await assertCompanyExists(req.body.company);

  const drive = await PlacementDrive.create({
    ...req.body,
    createdBy: req.user._id,
  });
  await recordAuditLog({ req, action: "placement_drive_created", entityType: "PlacementDrive", entityId: drive._id });

  const populatedDrive = await PlacementDrive.findById(drive._id).populate(drivePopulate);
  res.status(201).json(new ApiResponse(201, populatedDrive, "Placement drive created successfully"));
});

const updatePlacementDrive = asyncHandler(async (req, res) => {
  if (req.body.company) {
    await assertCompanyExists(req.body.company);
  }

  const drive = await PlacementDrive.findByIdAndUpdate(req.params.id, req.body, {
    returnDocument: "after",
    runValidators: true,
  }).populate(drivePopulate);

  if (!drive) {
    throw new ApiError(404, "Placement drive not found");
  }

  await recordAuditLog({ req, action: "placement_drive_updated", entityType: "PlacementDrive", entityId: drive._id });
  res.status(200).json(new ApiResponse(200, drive, "Placement drive updated successfully"));
});

module.exports = {
  getPlacementDrives,
  createPlacementDrive,
  updatePlacementDrive,
};
