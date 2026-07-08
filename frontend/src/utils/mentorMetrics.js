import { statusLabels } from "./studentMetrics";

const activeStatuses = [
  "under-review",
  "mentor-assigned",
  "mentoring-scheduled",
  "mentoring-completed",
  "mentor-recommended",
  "shortlisted",
  "recruiter-review",
  "interview-round-1",
  "interview-round-2",
  "hr-round",
  "selected",
  "assessment-scheduled",
  "assessment-completed",
  "interview-scheduled",
  "interview-completed",
];

export const formatMentorDate = (value, options = {}) => {
  if (!value) return "Not set";
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    ...options,
  }).format(new Date(value));
};

export const formatMentorDateTime = (value) =>
  formatMentorDate(value, { hour: "2-digit", minute: "2-digit" });

export const getAssignedStudents = (applications = []) => {
  const map = new Map();

  applications.forEach((application) => {
    const student = application.student;
    if (!student?._id) return;

    const existing = map.get(student._id);
    const records = [...(existing?.applicationRecords || []), application].sort(
      (a, b) => new Date(b.updatedAt || b.appliedAt || 0) - new Date(a.updatedAt || a.appliedAt || 0)
    );

    map.set(student._id, {
      ...student,
      applications: records.length,
      applicationRecords: records,
      latestApplication: records[0],
      lastActivityAt: records[0]?.updatedAt || records[0]?.appliedAt,
    });
  });

  return Array.from(map.values()).sort((a, b) => new Date(b.lastActivityAt || 0) - new Date(a.lastActivityAt || 0));
};

export const getStudentInterviews = (student, interviews = []) =>
  interviews.filter((interview) => {
    const interviewStudentId = interview.application?.student?._id || interview.application?.student;
    return interviewStudentId === student?._id;
  });

export const getApplicationInterviews = (applicationId, interviews = []) =>
  interviews.filter((interview) => {
    const interviewApplicationId = interview.application?._id || interview.application;
    return interviewApplicationId === applicationId;
  });

export const getSkillSignals = (applications = [], skills = []) => {
  const map = new Map();

  applications.forEach((application) => {
    (application.job?.requiredSkills || []).forEach((skill) => {
      if (skill?._id) map.set(skill._id, skill);
    });
  });

  if (map.size === 0) {
    skills.slice(0, 8).forEach((skill) => map.set(skill._id, skill));
  }

  return Array.from(map.values());
};

export const getReadinessScoreForStudent = ({ student, applications = [], interviews = [], skills = [] }) => {
  const profile = student?.profile || {};
  const filledProfileFields = ["phone", "headline", "college", "branch", "graduationYear", "cgpa", "github", "linkedin"].filter((field) =>
    Boolean(profile[field])
  ).length;
  const profileScore = filledProfileFields / 8;
  const resumeScore = profile.resume?.fileName ? 1 : 0;
  const activeApplicationScore = Math.min(applications.filter((application) => activeStatuses.includes(application.status)).length / 3, 1);
  const interviewScore = Math.min(interviews.length / 2, 1);
  const skillScore = Math.min(getSkillSignals(applications, skills).length / 6, 1);

  return Math.round(profileScore * 28 + resumeScore * 22 + activeApplicationScore * 20 + interviewScore * 15 + skillScore * 15);
};

export const getMentorDashboardStats = ({ applications = [], notes = [] }) => {
  const students = getAssignedStudents(applications);
  const scheduledSessions = applications.filter((application) => application.status === "mentoring-scheduled");

  return {
    students: students.length,
    activeApplications: applications.filter((application) => activeStatuses.includes(application.status)).length,
    shortlisted: applications.filter((application) => application.status === "mentor-recommended").length,
    upcomingInterviews: scheduledSessions.length,
    notes: notes.length,
  };
};

export const getRecentMentorActivity = ({ applications = [], notes = [] }) => {
  const timelineActivities = applications.flatMap((application) =>
    (application.timeline || []).map((activity) => ({
      id: `${application._id}-${activity.changedAt}-${activity.status}`,
      title: `${application.student?.name || "Student"} - ${application.job?.title || "Application"}`,
      description: activity.note || statusLabels[activity.status] || "Status updated",
      at: activity.changedAt,
      status: activity.status,
    }))
  );

  const noteActivities = notes.map((note) => ({
    id: note._id,
    title: `${note.student?.name || "Student"} note`,
    description: note.note,
    at: note.updatedAt || note.createdAt,
    rating: note.rating,
  }));

  return [...timelineActivities, ...noteActivities]
    .filter((activity) => activity.at)
    .sort((a, b) => new Date(b.at) - new Date(a.at))
    .slice(0, 8);
};
