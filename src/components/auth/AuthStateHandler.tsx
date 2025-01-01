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

      // Define public paths that don't require authentication
      const publicPaths = [
        "/",
        "/auth",
        "/register",
        "/privacy-policy",
        "/changelog",
        "/unity",
        "/elevate",
        "/unity/team",
        "/impressum"
      ];

      const isPublicPath = publicPaths.some(path => 
        location.pathname === path || location.pathname.startsWith(path + "/")
      );

      try {
        if (event === "SIGNED_IN") {
          // Only redirect to dashboard if coming from auth page
          if (location.pathname === "/auth") {
            navigate("/dashboard");
          }
        } else if (event === "SIGNED_OUT") {
          // Only redirect to auth if not on a public path
          if (!isPublicPath) {
            navigate("/auth");
          }
        } else if (event === "TOKEN_REFRESHED") {
          console.log("[Auth] Token refreshed for user:", session?.user?.id);
        }
      } catch (error) {
        console.error("[Auth] Navigation error:", error);
      }
    });

    // Set up session refresh interval - every 2 minutes to prevent expiration
    const refreshInterval = setInterval(async () => {
      try {
        const session = await refreshSession();
        // Only redirect to auth if session refresh fails and we're not on a public path
        if (!session && !location.pathname.startsWith("/auth")) {
          const publicPaths = [
            "/",
            "/privacy-policy",
            "/changelog",
            "/unity",
            "/elevate",
            "/unity/team",
            "/impressum"
          ];
          
          const isPublicPath = publicPaths.some(path => 
            location.pathname === path || location.pathname.startsWith(path + "/")
          );

          if (!isPublicPath) {
            navigate("/auth");
          }
        }
      } catch (error) {
        console.error("[Auth] Refresh error:", error);
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