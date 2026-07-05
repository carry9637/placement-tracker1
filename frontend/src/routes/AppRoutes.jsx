import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { PublicLayout } from "../layouts/PublicLayout";
import { StudentLayout } from "../layouts/StudentLayout";
import { MentorLayout } from "../layouts/MentorLayout";
import { AdminLayout } from "../layouts/AdminLayout";
import { PublicRoute } from "./PublicRoute";
import { ProtectedRoute } from "./ProtectedRoute";
import { RoleBasedRoute } from "./RoleBasedRoute";
import { LandingPage } from "../pages/public/LandingPage";
import { LoginPage } from "../pages/auth/LoginPage";
import { RegisterPage } from "../pages/auth/RegisterPage";
import { ForgotPasswordPage } from "../pages/auth/ForgotPasswordPage";
import { NotFoundPage } from "../pages/errors/NotFoundPage";
import { StudentDashboard } from "../pages/student/StudentDashboard";
import { StudentProfilePage } from "../pages/student/StudentProfilePage";
import { StudentJobsPage } from "../pages/student/StudentJobsPage";
import { StudentApplicationsPage } from "../pages/student/StudentApplicationsPage";
import { StudentInterviewsPage } from "../pages/student/StudentInterviewsPage";
import { StudentSkillsPage } from "../pages/student/StudentSkillsPage";
import { StudentReadinessPage } from "../pages/student/StudentReadinessPage";
import { StudentSettingsPage } from "../pages/student/StudentSettingsPage";
import { MentorDashboard } from "../pages/mentor/MentorDashboard";
import { AdminDashboard } from "../pages/admin/AdminDashboard";
import { AdminCompaniesPage } from "../pages/admin/AdminCompaniesPage";
import { AdminJobsPage } from "../pages/admin/AdminJobsPage";
import { AdminSkillsPage } from "../pages/admin/AdminSkillsPage";
import { AdminStudentsPage } from "../pages/admin/AdminStudentsPage";
import { PlaceholderPage } from "../pages/public/PlaceholderPage";

export function AppRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route element={<PublicLayout />}>
          <Route index element={<LandingPage />} />
          <Route element={<PublicRoute />}>
            <Route path="login" element={<LoginPage />} />
            <Route path="register" element={<RegisterPage />} />
            <Route path="forgot-password" element={<ForgotPasswordPage />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route element={<RoleBasedRoute allowedRoles={["student"]} />}>
            <Route path="student" element={<StudentLayout />}>
              <Route index element={<Navigate to="/student/dashboard" replace />} />
              <Route path="dashboard" element={<StudentDashboard />} />
              <Route path="profile" element={<StudentProfilePage />} />
              <Route path="jobs" element={<StudentJobsPage />} />
              <Route path="applications" element={<StudentApplicationsPage />} />
              <Route path="interviews" element={<StudentInterviewsPage />} />
              <Route path="skills" element={<StudentSkillsPage />} />
              <Route path="readiness" element={<StudentReadinessPage />} />
              <Route path="settings" element={<StudentSettingsPage />} />
            </Route>
          </Route>

          <Route element={<RoleBasedRoute allowedRoles={["mentor"]} />}>
            <Route path="mentor" element={<MentorLayout />}>
              <Route index element={<Navigate to="/mentor/dashboard" replace />} />
              <Route path="dashboard" element={<MentorDashboard />} />
              <Route path="students" element={<PlaceholderPage title="Students" role="Mentor" />} />
              <Route path="reviews" element={<PlaceholderPage title="Reviews" role="Mentor" />} />
              <Route path="interviews" element={<PlaceholderPage title="Interviews" role="Mentor" />} />
              <Route path="insights" element={<PlaceholderPage title="Insights" role="Mentor" />} />
            </Route>
          </Route>

          <Route element={<RoleBasedRoute allowedRoles={["admin"]} />}>
            <Route path="admin" element={<AdminLayout />}>
              <Route index element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="companies" element={<AdminCompaniesPage />} />
              <Route path="jobs" element={<AdminJobsPage />} />
              <Route path="skills" element={<AdminSkillsPage />} />
              <Route path="students" element={<AdminStudentsPage />} />
              <Route path="reports" element={<PlaceholderPage title="Reports" role="Admin" />} />
              <Route path="settings" element={<PlaceholderPage title="Settings" role="Admin" />} />
            </Route>
          </Route>
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </AnimatePresence>
  );
}
