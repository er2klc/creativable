import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useSessionManagement } from "@/hooks/auth/use-session-management";

export const AuthStateHandler = () => {
  const navigate = useNavigate();
  const { handleSessionError, refreshSession } = useSessionManagement();

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("[Auth] State changed:", event);

      if (event === "SIGNED_IN") {
        navigate("/dashboard");
      } else if (event === "SIGNED_OUT" || event === "USER_DELETED") {
        navigate("/auth");
      } else if (event === "TOKEN_REFRESHED") {
        console.log("[Auth] Token refreshed for user:", session?.user?.id);
      }
    });

    // Set up session refresh interval
    const refreshInterval = setInterval(refreshSession, 10 * 60 * 1000); // Every 10 minutes

    return () => {
      console.log("[Auth] Cleaning up auth listener");
      subscription.unsubscribe();
      clearInterval(refreshInterval);
    };
  }, [navigate]);

  return null;
};