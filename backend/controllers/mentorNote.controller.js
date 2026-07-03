const Application = require("../models/Application");
const MentorNote = require("../models/MentorNote");
const User = require("../models/User");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const asyncHandler = require("../utils/asyncHandler");
const buildQueryFeatures = require("../utils/queryFeatures");

const mentorNotePopulate = [
  { path: "mentor", select: "name email role" },
  { path: "student", select: "name email role" },
  { path: "application", select: "job status", populate: { path: "job", select: "title" } },
];

const getMentorNoteFilter = (req) => {
  if (req.user.role === "mentor") {
    return { mentor: req.user._id };
  }

  if (req.user.role === "student") {
    return { student: req.user._id, visibility: "student-visible" };
  }

  return {};
};

const getMentorNotes = asyncHandler(async (req, res) => {
  const { items, meta } = await buildQueryFeatures({
    model: MentorNote,
    query: req.query,
    allowedFilters: ["mentor", "student", "application", "rating", "visibility"],
    baseFilter: getMentorNoteFilter(req),
    populate: mentorNotePopulate,
  });

  res.status(200).json(new ApiResponse(200, items, "Mentor notes fetched successfully", meta));
});

const getMentorNoteById = asyncHandler(async (req, res) => {
  const note = await MentorNote.findOne({ _id: req.params.id, ...getMentorNoteFilter(req) }).populate(mentorNotePopulate);

  if (!note) {
    throw new ApiError(404, "Mentor note not found");
  }

  res.status(200).json(new ApiResponse(200, note, "Mentor note fetched successfully"));
});

const createMentorNote = asyncHandler(async (req, res) => {
  const student = await User.findOne({ _id: req.body.student, role: "student", isActive: true });

  if (!student) {
    throw new ApiError(404, "Student not found");
  }

  if (req.body.application) {
    const application = await Application.findOne({
      _id: req.body.application,
      student: student._id,
    });

    if (!application) {
      throw new ApiError(404, "Application not found for this student");
    }
  }

  const note = await MentorNote.create({
    ...req.body,
    mentor: req.user._id,
  });

  if (req.body.application) {
    await Application.findByIdAndUpdate(req.body.application, {
      $addToSet: { mentorNotes: note._id },
    });
  }

  const populatedNote = await MentorNote.findById(note._id).populate(mentorNotePopulate);
  res.status(201).json(new ApiResponse(201, populatedNote, "Mentor note created successfully"));
});

const updateMentorNote = asyncHandler(async (req, res) => {
  const filter = req.user.role === "admin" ? { _id: req.params.id } : { _id: req.params.id, mentor: req.user._id };
  const note = await MentorNote.findOneAndUpdate(filter, req.body, {
    returnDocument: "after",
    runValidators: true,
  }).populate(mentorNotePopulate);

  if (!note) {
    throw new ApiError(404, "Mentor note not found");
  }

  res.status(200).json(new ApiResponse(200, note, "Mentor note updated successfully"));
});

const deleteMentorNote = asyncHandler(async (req, res) => {
  const filter = req.user.role === "admin" ? { _id: req.params.id } : { _id: req.params.id, mentor: req.user._id };
  const note = await MentorNote.findOneAndDelete(filter);

  if (!note) {
    throw new ApiError(404, "Mentor note not found");
  }

  if (note.application) {
    await Application.findByIdAndUpdate(note.application, {
      $pull: { mentorNotes: note._id },
    });
  }

  res.status(200).json(new ApiResponse(200, null, "Mentor note deleted successfully"));
});

module.exports = {
  getMentorNotes,
  getMentorNoteById,
  createMentorNote,
  updateMentorNote,
  deleteMentorNote,
};
