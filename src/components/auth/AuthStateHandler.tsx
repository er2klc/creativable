import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useSessionManagement } from "@/hooks/auth/use-session-management";
import { AuthChangeEvent } from "@supabase/supabase-js";

export const AuthStateHandler = () => {
  const navigate = useNavigate();
  const { handleSessionError, refreshSession } = useSessionManagement();

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event: AuthChangeEvent, session) => {
      console.log("[Auth] State changed:", event);

      if (event === "SIGNED_IN") {
        navigate("/dashboard");
      } else if (event === "SIGNED_OUT") {
        navigate("/auth");
      } else if (event === "TOKEN_REFRESHED") {
        console.log("[Auth] Token refreshed for user:", session?.user?.id);
      }
    });

    // Set up session refresh interval - every 2 minutes to prevent expiration
    const refreshInterval = setInterval(async () => {
      try {
        await refreshSession();
      } catch (error) {
        console.error("[Auth] Refresh error:", error);
        handleSessionError(error);
      }
    }, 2 * 60 * 1000);

    return () => {
      console.log("[Auth] Cleaning up auth listener");
      subscription.unsubscribe();
      clearInterval(refreshInterval);
    };
  }, [navigate, refreshSession, handleSessionError]);

  return null;
};