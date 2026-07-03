export const statusLabels = {
  applied: "Applied",
  shortlisted: "Shortlisted",
  "assessment-scheduled": "Assessment Scheduled",
  "assessment-completed": "Assessment Completed",
  "interview-scheduled": "Interview Scheduled",
  "interview-completed": "Interview Completed",
  "offer-received": "Offer Received",
  rejected: "Rejected",
  withdrawn: "Withdrawn",
};

export const getApplicationStats = (applications = []) => {
  const stats = applications.reduce(
    (acc, application) => {
      acc.total += 1;
      acc.byStatus[application.status] = (acc.byStatus[application.status] || 0) + 1;
      if (["shortlisted", "assessment-scheduled", "assessment-completed", "interview-scheduled", "interview-completed", "offer-received"].includes(application.status)) {
        acc.active += 1;
      }
      if (application.status === "offer-received") acc.offers += 1;
      return acc;
    },
    { total: 0, active: 0, offers: 0, byStatus: {} }
  );

  return stats;
};

export const getReadinessScore = ({ user, applications = [], interviews = [], skills = [] }) => {
  const profile = user?.profile || {};
  const profileFields = ["phone", "headline", "college", "branch", "graduationYear", "cgpa", "github", "linkedin"];
  const profileScore = profileFields.filter((field) => Boolean(profile[field])).length / profileFields.length;
  const resumeScore = profile.resume?.fileName ? 1 : 0;
  const applicationScore = Math.min(applications.length / 5, 1);
  const interviewScore = Math.min(interviews.length / 3, 1);
  const skillScore = Math.min(skills.length / 8, 1);

  return Math.round((profileScore * 30 + resumeScore * 20 + applicationScore * 20 + interviewScore * 15 + skillScore * 15));
};

export const formatDate = (value) => {
  if (!value) return "Not set";
  return new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(value));
};
