import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useSessionManagement } from "@/hooks/auth/use-session-management";
import { AuthChangeEvent } from "@supabase/supabase-js";

export const AuthStateHandler = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { handleSessionError, refreshSession } = useSessionManagement();

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event: AuthChangeEvent, session) => {
      console.log("[Auth] State changed:", event);

      try {
        if (event === "SIGNED_IN") {
          // Only redirect to dashboard if coming from auth page
          if (location.pathname === "/auth") {
            navigate("/dashboard");
          }
        } else if (event === "SIGNED_OUT") {
          navigate("/auth");
        } else if (event === "TOKEN_REFRESHED") {
          console.log("[Auth] Token refreshed for user:", session?.user?.id);
        }
      } catch (error) {
        console.error("[Auth] Navigation error:", error);
        // Don't redirect on error, just log it
      }
    });

    // Set up session refresh interval - every 2 minutes to prevent expiration
    const refreshInterval = setInterval(async () => {
      try {
        const session = await refreshSession();
        if (!session && location.pathname !== "/auth") {
          // Only redirect to auth if session refresh fails and we're not already on auth page
          const publicPaths = ["/", "/privacy-policy", "/changelog", "/unity", "/elevate"];
          if (!publicPaths.some(path => location.pathname.startsWith(path))) {
            navigate("/auth");
          }
        }
      } catch (error) {
        console.error("[Auth] Refresh error:", error);
        // Don't redirect on network errors, let the user continue
      }
    }, 2 * 60 * 1000);

    return () => {
      console.log("[Auth] Cleaning up auth listener");
      subscription.unsubscribe();
      clearInterval(refreshInterval);
    };
  }, [navigate, refreshSession, handleSessionError, location.pathname]);

  return null;
};