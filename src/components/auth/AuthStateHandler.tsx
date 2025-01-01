import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useSessionManagement } from "@/hooks/auth/use-session-management";
import { AuthChangeEvent } from "@supabase/supabase-js";

// Define public paths
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

  const isPublicPath = (pathname: string) => 
    PUBLIC_PATHS.some(path => pathname === path || pathname.startsWith(path + "/"));

  const safeNavigate = async (path: string) => {
    try {
      await navigate(path);
    } catch (error) {
      console.error(`[Auth] Navigation to ${path} failed:`, error);
    }
  };

  useEffect(() => {
    let sessionRefreshInterval: NodeJS.Timeout | null = null;
    const isOnPublicPath = isPublicPath(location.pathname);

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event: AuthChangeEvent, session) => {
      console.log("[Auth] State changed:", event, "Current path:", location.pathname);
      console.log("[Auth] Is public path:", isOnPublicPath);

      try {
        if (event === "SIGNED_IN") {
          if (isOnPublicPath) {
            console.log("[Auth] Staying on public path:", location.pathname);
          } else if (location.pathname === "/auth") {
            console.log("[Auth] Redirecting to dashboard");
            await safeNavigate("/dashboard");
          }
        } else if (event === "SIGNED_OUT") {
          if (sessionRefreshInterval) {
            clearInterval(sessionRefreshInterval);
            sessionRefreshInterval = null;
          }
          if (!isOnPublicPath) {
            console.log("[Auth] Redirecting to auth after sign-out");
            await safeNavigate("/auth");
          }
        } else if (event === "TOKEN_REFRESHED") {
          console.log("[Auth] Token refreshed for user:", session?.user?.id);
        }
      } catch (error) {
        console.error("[Auth] Navigation error:", error);
        if (!isOnPublicPath) {
          await safeNavigate("/auth");
        }
      }
    });

    // Set up session refresh interval
    if (!isOnPublicPath) {
      sessionRefreshInterval = setInterval(async () => {
        try {
          const session = await refreshSession();
          if (!session) {
            console.log("[Auth] Session refresh failed - redirecting to auth");
            await safeNavigate("/auth");
          }
        } catch (error) {
          console.error("[Auth] Refresh error:", error);
          await safeNavigate("/auth");
        }
      }, 2 * 60 * 1000);
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
