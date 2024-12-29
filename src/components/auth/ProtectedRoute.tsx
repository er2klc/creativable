import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";

export const ProtectedRoute = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" />;
  }

  return <Outlet />;
};