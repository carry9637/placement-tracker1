export const roleDashboardPaths = {
  student: "/student/dashboard",
  mentor: "/mentor/dashboard",
  admin: "/admin/dashboard",
  recruiter: "/recruiter/dashboard",
};

export const getRoleDashboardPath = (role) => roleDashboardPaths[role] || "/login";
