export const statusLabels = {
  applied: "Applied",
  "under-review": "Under Review",
  "mentor-assigned": "Mentor Assigned",
  "mentoring-scheduled": "Mentoring Scheduled",
  "mentoring-completed": "Mentoring Completed",
  "mentor-recommended": "Mentor Recommended",
  shortlisted: "Shortlisted",
  "recruiter-review": "Recruiter Review",
  "interview-round-1": "Interview Round 1",
  "interview-round-2": "Interview Round 2",
  "hr-round": "HR Round",
  selected: "Selected",
  "offer-released": "Offer Released",
  "offer-accepted": "Offer Accepted",
  "offer-declined": "Offer Declined",
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
      if (["under-review", "mentor-assigned", "mentoring-scheduled", "mentoring-completed", "mentor-recommended", "shortlisted", "recruiter-review", "interview-round-1", "interview-round-2", "hr-round", "selected", "assessment-scheduled", "assessment-completed", "interview-scheduled", "interview-completed", "offer-received", "offer-released"].includes(application.status)) {
        acc.active += 1;
      }
      if (["offer-received", "offer-released", "offer-accepted"].includes(application.status)) acc.offers += 1;
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
