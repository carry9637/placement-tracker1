import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { PublicLayout } from "../layouts/PublicLayout";
import { StudentLayout } from "../layouts/StudentLayout";
import { MentorLayout } from "../layouts/MentorLayout";
import { AdminLayout } from "../layouts/AdminLayout";
import { RecruiterLayout } from "../layouts/RecruiterLayout";
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
import { AdminDrivesPage } from "../pages/admin/AdminDrivesPage";
import { AdminReportsPage } from "../pages/admin/AdminReportsPage";
import { PlaceholderPage } from "../pages/public/PlaceholderPage";
import { MentorStudentsPage } from "../pages/mentor/MentorStudentsPage";
import { MentorApplicationsPage } from "../pages/mentor/MentorApplicationsPage";
import { MentorInterviewsPage } from "../pages/mentor/MentorInterviewsPage";
import { MentorNotesPage } from "../pages/mentor/MentorNotesPage";
import { RecruiterDashboard } from "../pages/recruiter/RecruiterDashboard";
import { RecruiterCompanyPage } from "../pages/recruiter/RecruiterCompanyPage";
import { RecruiterJobsPage } from "../pages/recruiter/RecruiterJobsPage";
import { RecruiterApplicationsPage } from "../pages/recruiter/RecruiterApplicationsPage";
import { RecruiterCandidateDetailsPage } from "../pages/recruiter/RecruiterCandidateDetailsPage";
import { RecruiterInterviewsPage } from "../pages/recruiter/RecruiterInterviewsPage";
import { RecruiterOffersPage } from "../pages/recruiter/RecruiterOffersPage";
import { RecruiterNotificationsPage } from "../pages/recruiter/RecruiterNotificationsPage";
import { RecruiterSettingsPage } from "../pages/recruiter/RecruiterSettingsPage";

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
              <Route path="students" element={<MentorStudentsPage />} />
              <Route path="applications" element={<MentorApplicationsPage />} />
              <Route path="interviews" element={<MentorInterviewsPage />} />
              <Route path="notes" element={<MentorNotesPage />} />
            </Route>
          </Route>

          <Route element={<RoleBasedRoute allowedRoles={["admin"]} />}>
            <Route path="admin" element={<AdminLayout />}>
              <Route index element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="companies" element={<AdminCompaniesPage />} />
              <Route path="jobs" element={<AdminJobsPage />} />
              <Route path="drives" element={<AdminDrivesPage />} />
              <Route path="skills" element={<AdminSkillsPage />} />
              <Route path="students" element={<AdminStudentsPage />} />
              <Route path="reports" element={<AdminReportsPage />} />
              <Route path="settings" element={<PlaceholderPage title="Settings" role="Admin" />} />
            </Route>
          </Route>

          <Route element={<RoleBasedRoute allowedRoles={["recruiter"]} />}>
            <Route path="recruiter" element={<RecruiterLayout />}>
              <Route index element={<Navigate to="/recruiter/dashboard" replace />} />
              <Route path="dashboard" element={<RecruiterDashboard />} />
              <Route path="company" element={<RecruiterCompanyPage />} />
              <Route path="jobs" element={<RecruiterJobsPage />} />
              <Route path="applications" element={<RecruiterApplicationsPage />} />
              <Route path="candidates/:applicationId" element={<RecruiterCandidateDetailsPage />} />
              <Route path="interviews" element={<RecruiterInterviewsPage />} />
              <Route path="offers" element={<RecruiterOffersPage />} />
              <Route path="notifications" element={<RecruiterNotificationsPage />} />
              <Route path="settings" element={<RecruiterSettingsPage />} />
            </Route>
          </Route>
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </AnimatePresence>
  );
}
