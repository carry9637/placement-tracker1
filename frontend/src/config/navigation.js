import {
  FiActivity,
  FiBarChart2,
  FiBriefcase,
  FiCalendar,
  FiCheckSquare,
  FiClipboard,
  FiCompass,
  FiFileText,
  FiGrid,
  FiLayers,
  FiMessageSquare,
  FiSliders,
  FiSettings,
  FiShield,
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
    { label: "Reviews", path: "/mentor/reviews", icon: FiMessageSquare },
    { label: "Interviews", path: "/mentor/interviews", icon: FiCalendar },
    { label: "Insights", path: "/mentor/insights", icon: FiBarChart2 },
  ],
  admin: [
    { label: "Dashboard", path: "/admin/dashboard", icon: FiGrid },
    { label: "Companies", path: "/admin/companies", icon: FiBriefcase },
    { label: "Jobs", path: "/admin/jobs", icon: FiLayers },
    { label: "Students", path: "/admin/students", icon: FiUsers },
    { label: "Reports", path: "/admin/reports", icon: FiActivity },
    { label: "Settings", path: "/admin/settings", icon: FiSettings },
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
};
