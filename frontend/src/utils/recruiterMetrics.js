import { statusLabels } from "./studentMetrics";

export const recruiterReviewStatuses = [
  "shortlisted",
  "recruiter-review",
  "interview-round-1",
  "interview-round-2",
  "hr-round",
  "selected",
];

export const closedStatuses = ["offer-released", "offer-accepted", "offer-declined", "rejected", "withdrawn"];

export const formatRecruiterDate = (value) => {
  if (!value) return "Not set";
  return new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(value));
};

export const formatRecruiterDateTime = (value) => {
  if (!value) return "Not set";
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
};

export const getRecruiterCompanyId = (user) => user?.recruiterCompany?._id || user?.recruiterCompany || "";

export const getRecruiterStats = ({ jobs = [], applications = [], interviews = [] }) => {
  const openJobs = jobs.filter((job) => job.status === "open").length;
  const activeJobs = jobs.filter((job) => ["open", "draft"].includes(job.status)).length;
  const pendingReview = applications.filter((application) => ["shortlisted", "recruiter-review"].includes(application.status)).length;
  const interviewsPending = interviews.filter((interview) => interview.result === "pending").length;
  const today = new Date().toDateString();
  const todaysInterviews = interviews.filter((interview) => interview.date && new Date(interview.date).toDateString() === today).length;
  const offers = applications.filter((application) => ["offer-released", "offer-accepted", "offer-declined"].includes(application.status)).length;
  const offersSent = applications.filter((application) => ["offer-released", "offer-accepted"].includes(application.status)).length;

  return {
    openJobs,
    activeJobs,
    applicants: applications.length,
    pendingReview,
    interviewsPending,
    todaysInterviews,
    offers,
    offersSent,
  };
};

export const interviewModeOptions = [
  ["online", "Online"],
  ["offline", "Offline"],
  ["hybrid", "Hybrid"],
  ["phone", "Phone"],
];

export const getCandidateReadinessScore = (application, interviews = []) => {
  const profile = application?.student?.profile || {};
  const profileFields = ["phone", "headline", "college", "branch", "graduationYear", "cgpa", "github", "linkedin"];
  const profileScore = profileFields.filter((field) => Boolean(profile[field])).length / profileFields.length;
  const resumeScore = profile.resume?.fileName ? 1 : 0;
  const mentorScore = application?.mentorNotes?.length ? 1 : 0;
  const interviewScore = Math.min(interviews.length / 3, 1);

  return Math.round(profileScore * 35 + resumeScore * 25 + mentorScore * 25 + interviewScore * 15);
};

export const getLatestMentorRecommendation = (application) =>
  [...(application?.mentorNotes || [])]
    .filter((note) => note.visibility !== "mentor-only")
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))[0] || null;

export const getApplicationInterviews = (applicationId, interviews = []) =>
  interviews.filter((interview) => (interview.application?._id || interview.application) === applicationId);

export const applicationStatusOptions = [
  ["", "All statuses"],
  ["shortlisted", statusLabels.shortlisted],
  ["recruiter-review", statusLabels["recruiter-review"]],
  ["interview-round-1", statusLabels["interview-round-1"]],
  ["interview-round-2", statusLabels["interview-round-2"]],
  ["hr-round", statusLabels["hr-round"]],
  ["selected", statusLabels.selected],
  ["offer-released", statusLabels["offer-released"]],
  ["offer-accepted", statusLabels["offer-accepted"]],
  ["offer-declined", statusLabels["offer-declined"]],
  ["rejected", statusLabels.rejected],
];

export const interviewTypeOptions = [
  ["technical", "Technical"],
  ["hr", "HR"],
  ["managerial", "Managerial"],
  ["aptitude", "Aptitude"],
  ["group-discussion", "Group discussion"],
  ["other", "Other"],
];
