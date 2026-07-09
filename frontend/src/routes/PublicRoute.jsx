import { Navigate, Outlet } from "react-router-dom";
import { LoadingScreen } from "../components/feedback/LoadingScreen";
import { useAuth } from "../hooks/useAuth";
import { getRoleDashboardPath } from "../utils/roleRedirects";

export function PublicRoute() {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  if (isAuthenticated) {
    return <Navigate to={getRoleDashboardPath(user.role)} replace />;
  }

  return <Outlet />;
}
