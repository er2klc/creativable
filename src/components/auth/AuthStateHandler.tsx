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
  "/impressum"
];

export const AuthStateHandler = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { handleSessionError, refreshSession } = useSessionManagement();

  const isPublicPath = (pathname: string) => {
    // Check if the current path exactly matches a public path
    if (PUBLIC_PATHS.includes(pathname)) {
      return true;
    }
    // Check if the current path starts with any of the public paths
    return PUBLIC_PATHS.some(path => 
      pathname.startsWith(path + "/")
    );
  };

  const safeNavigate = async (path: string) => {
    try {
      await navigate(path);
    } catch (error) {
      console.error(`[Auth] Navigation to ${path} failed:`, error);
    }
  };

  useEffect(() => {
    let sessionRefreshInterval: NodeJS.Timeout | null = null;
    const currentPath = location.pathname;

    console.log("[Auth] Current path:", currentPath);

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event: AuthChangeEvent, session) => {
      console.log("[Auth] State changed:", event, "Current path:", currentPath);

      try {
        if (event === "SIGNED_IN") {
          if (currentPath === "/auth") {
            console.log("[Auth] Redirecting to dashboard from auth page");
            await safeNavigate("/dashboard");
          }
        } else if (event === "SIGNED_OUT") {
          if (sessionRefreshInterval) {
            clearInterval(sessionRefreshInterval);
            sessionRefreshInterval = null;
          }
          if (!isPublicPath(currentPath)) {
            console.log("[Auth] Redirecting to auth after sign-out");
            await safeNavigate("/auth");
          }
        } else if (event === "TOKEN_REFRESHED") {
          console.log("[Auth] Token refreshed for user:", session?.user?.id);
        }
      } catch (error) {
        console.error("[Auth] Navigation error:", error);
        handleSessionError(error);
      }
    });

    // Only set up session refresh for authenticated paths
    if (!isPublicPath(currentPath)) {
      sessionRefreshInterval = setInterval(async () => {
        try {
          const session = await refreshSession();
          if (!session && !isPublicPath(currentPath)) {
            console.log("[Auth] Session refresh failed - redirecting to auth");
            await safeNavigate("/auth");
          }
        } catch (error) {
          console.error("[Auth] Refresh error:", error);
          handleSessionError(error);
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