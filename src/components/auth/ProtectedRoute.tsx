import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return null;
  }

  if (!user) {
    // Store the attempted URL to redirect back after login
    return <Navigate to="/auth" replace state={{ from: location }} />;
  }

  return <>{children}</>;
};