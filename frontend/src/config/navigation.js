import {
  FiActivity,
  FiBarChart2,
  FiBell,
  FiBriefcase,
  FiCalendar,
  FiCheckSquare,
  FiClipboard,
  FiCompass,
  FiFileText,
  FiGrid,
  FiLayers,
  FiMessageSquare,
  FiSend,
  FiSliders,
  FiSettings,
  FiShield,
  FiFlag,
  FiTarget,
  FiUsers,
} from "react-icons/fi";

export const publicNav = [
  { label: "Overview", href: "/" },
  { label: "Login", href: "/login" },
  { label: "Register", href: "/register" },
];

export const roleNavigation = {
  student: [
    { label: "Dashboard", path: "/student/dashboard", icon: FiGrid },
    { label: "Profile", path: "/student/profile", icon: FiUsers },
    { label: "Jobs", path: "/student/jobs", icon: FiBriefcase },
    { label: "Applications", path: "/student/applications", icon: FiClipboard },
    { label: "Interviews", path: "/student/interviews", icon: FiCalendar },
    { label: "Skills", path: "/student/skills", icon: FiLayers },
    { label: "Readiness", path: "/student/readiness", icon: FiTarget },
    { label: "Settings", path: "/student/settings", icon: FiSliders },
  ],
  mentor: [
    { label: "Dashboard", path: "/mentor/dashboard", icon: FiGrid },
    { label: "Students", path: "/mentor/students", icon: FiUsers },
    { label: "Applications", path: "/mentor/applications", icon: FiClipboard },
    { label: "Sessions", path: "/mentor/interviews", icon: FiCalendar },
    { label: "Notes", path: "/mentor/notes", icon: FiMessageSquare },
  ],
  admin: [
    { label: "Dashboard", path: "/admin/dashboard", icon: FiGrid },
    { label: "Companies", path: "/admin/companies", icon: FiBriefcase },
    { label: "Jobs", path: "/admin/jobs", icon: FiLayers },
    { label: "Drives", path: "/admin/drives", icon: FiFlag },
    { label: "Skills", path: "/admin/skills", icon: FiTarget },
    { label: "Students", path: "/admin/students", icon: FiUsers },
    { label: "Reports", path: "/admin/reports", icon: FiActivity },
    { label: "Settings", path: "/admin/settings", icon: FiSettings },
  ],
  recruiter: [
    { label: "Dashboard", path: "/recruiter/dashboard", icon: FiGrid },
    { label: "My Company", path: "/recruiter/company", icon: FiBriefcase },
    { label: "My Jobs", path: "/recruiter/jobs", icon: FiLayers },
    { label: "Applications", path: "/recruiter/applications", icon: FiClipboard },
    { label: "Interviews", path: "/recruiter/interviews", icon: FiCalendar },
    { label: "Offers", path: "/recruiter/offers", icon: FiSend },
    { label: "Notifications", path: "/recruiter/notifications", icon: FiBell },
    { label: "Settings", path: "/recruiter/settings", icon: FiSettings },
  ],
};

export const roleQuickActions = {
  student: [
    { label: "Upload resume", icon: FiFileText },
    { label: "Find matching roles", icon: FiCompass },
    { label: "Review tasks", icon: FiCheckSquare },
  ],
  mentor: [
    { label: "Add note", icon: FiMessageSquare },
    { label: "Schedule mock", icon: FiCalendar },
    { label: "Review risk list", icon: FiShield },
  ],
  admin: [
    { label: "Create job", icon: FiBriefcase },
    { label: "Invite users", icon: FiUsers },
    { label: "Export report", icon: FiBarChart2 },
  ],
  recruiter: [
    { label: "Post job", icon: FiBriefcase },
    { label: "Review applicants", icon: FiClipboard },
    { label: "Schedule interview", icon: FiCalendar },
  ],
};
