const Skill = require("../models/Skill");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const asyncHandler = require("../utils/asyncHandler");
const buildQueryFeatures = require("../utils/queryFeatures");

const getSkills = asyncHandler(async (req, res) => {
  const { items, meta } = await buildQueryFeatures({
    model: Skill,
    query: req.query,
    searchableFields: ["name", "category"],
    allowedFilters: ["category", "level", "isActive"],
  });

  res.status(200).json(new ApiResponse(200, items, "Skills fetched successfully", meta));
});

const getSkillById = asyncHandler(async (req, res) => {
  const skill = await Skill.findById(req.params.id);

  if (!skill) {
    throw new ApiError(404, "Skill not found");
  }

  res.status(200).json(new ApiResponse(200, skill, "Skill fetched successfully"));
});

const createSkill = asyncHandler(async (req, res) => {
  const skill = await Skill.create(req.body);
  res.status(201).json(new ApiResponse(201, skill, "Skill created successfully"));
});

const updateSkill = asyncHandler(async (req, res) => {
  const skill = await Skill.findByIdAndUpdate(req.params.id, req.body, {
    returnDocument: "after",
    runValidators: true,
  });

  if (!skill) {
    throw new ApiError(404, "Skill not found");
  }

  res.status(200).json(new ApiResponse(200, skill, "Skill updated successfully"));
});

const deleteSkill = asyncHandler(async (req, res) => {
  const skill = await Skill.findByIdAndDelete(req.params.id);

  if (!skill) {
    throw new ApiError(404, "Skill not found");
  }

  res.status(200).json(new ApiResponse(200, null, "Skill deleted successfully"));
});

module.exports = {
  getSkills,
  getSkillById,
  createSkill,
  updateSkill,
  deleteSkill,
};
