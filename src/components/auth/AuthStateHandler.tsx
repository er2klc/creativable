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
      console.log("[Auth] State changed:", event, "Current path:", location.pathname);

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
      
      console.log("[Auth] Is public path:", isPublicPath, location.pathname);

      try {
        if (event === "SIGNED_IN") {
          if (location.pathname === "/auth") {
            navigate("/dashboard");
          } else if (isPublicPath) {
            console.log("[Auth] Staying on public path:", location.pathname);
          }
        } else if (event === "SIGNED_OUT") {
          if (!isPublicPath) {
            navigate("/auth");
          } else {
            console.log("[Auth] Staying on public path after sign out:", location.pathname);
          }
        } else if (event === "TOKEN_REFRESHED") {
          console.log("[Auth] Token refreshed for user:", session?.user?.id);
        }
      } catch (error) {
        console.error("[Auth] Navigation error:", error);
      }
    });

    // Set up session refresh interval
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

          console.log("[Auth] Session refresh - Is public path:", isPublicPath, location.pathname);

          if (!isPublicPath) {
            navigate("/auth");
          } else {
            console.log("[Auth] Staying on public path after session refresh:", location.pathname);
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