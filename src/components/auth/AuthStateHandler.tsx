import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useSessionManagement } from "@/hooks/auth/use-session-management";
import { AuthChangeEvent } from "@supabase/supabase-js";

// Define public paths outside to follow DRY principle
const PUBLIC_PATHS = [
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

export const AuthStateHandler = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { handleSessionError, refreshSession } = useSessionManagement();

  // Helper function to check if current path is public
  const isPublicPath = (pathname: string) => {
    return PUBLIC_PATHS.some(path => 
      pathname === path || pathname.startsWith(path + "/")
    );
  };

  useEffect(() => {
    let sessionRefreshInterval: NodeJS.Timeout | null = null;

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event: AuthChangeEvent, session) => {
      console.log("[Auth] State changed:", event, "Current path:", location.pathname);
      console.log("[Auth] Is public path:", isPublicPath(location.pathname), location.pathname);

      try {
        if (event === "SIGNED_IN" && location.pathname === "/auth") {
          console.log("[Auth] Redirecting to dashboard");
            await navigate("/dashboard");
          }
          // Remove the else condition to prevent unwanted redirects
        } else if (event === "SIGNED_OUT") {
          // Clear refresh interval on sign out
          if (sessionRefreshInterval) {
            clearInterval(sessionRefreshInterval);
            sessionRefreshInterval = null;
          }

          if (!isPublicPath(location.pathname)) {
            await navigate("/auth");
          }
        } else if (event === "TOKEN_REFRESHED") {
          console.log("[Auth] Token refreshed for user:", session?.user?.id);
        }
      } catch (error) {
        console.error("[Auth] Navigation error:", error);
        // Attempt fallback navigation if needed
        if (!isPublicPath(location.pathname)) {
          try {
            await navigate("/auth");
          } catch (fallbackError) {
            console.error("[Auth] Fallback navigation failed:", fallbackError);
          }
        }
      }
    });

    // Only set up refresh interval if user is on a private path
    if (!isPublicPath(location.pathname)) {
      sessionRefreshInterval = setInterval(async () => {
        try {
          const session = await refreshSession();
          
          if (!session && !isPublicPath(location.pathname)) {
            console.log("[Auth] Session refresh failed - redirecting to auth");
            await navigate("/auth");
          }
        } catch (error) {
          console.error("[Auth] Refresh error:", error);
          if (!isPublicPath(location.pathname)) {
            try {
              await navigate("/auth");
            } catch (fallbackError) {
              console.error("[Auth] Fallback navigation failed:", fallbackError);
            }
          }
        }
      }, 2 * 60 * 1000); // 2 minutes
    }

    return () => {
      console.log("[Auth] Cleaning up auth listener");
      subscription.unsubscribe();
      if (sessionRefreshInterval) {
        clearInterval(sessionRefreshInterval);
      }
    };
  }, [navigate, refreshSession, handleSessionError, location.pathname]);

  return null;
};
