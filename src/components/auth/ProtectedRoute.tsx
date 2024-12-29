import { Navigate, Outlet } from "react-router-dom";
import { useUser } from "@supabase/auth-helpers-react";

export const ProtectedRoute = () => {
  const user = useUser();

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return <Outlet />;
};