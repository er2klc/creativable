import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useSessionManagement } from "@/hooks/auth/use-session-management";
import { AuthChangeEvent } from "@supabase/supabase-js";

// Define strictly public paths only
const PUBLIC_PATHS = [
  "/",
  "/auth",
  "/register",
  "/privacy-policy",
  "/changelog",
  "/impressum"
];

// Define protected paths that should not redirect to dashboard
const PROTECTED_NO_REDIRECT = [
  "/unity",
  "/elevate",
  "/unity/team"
];

export const AuthStateHandler = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { handleSessionError, refreshSession } = useSessionManagement();

  const isPublicPath = (pathname: string) => {
    if (PUBLIC_PATHS.includes(pathname)) {
      return true;
    }
    return PUBLIC_PATHS.some(path => 
      pathname.startsWith(path + "/")
    );
  };

  const isProtectedNoRedirect = (pathname: string) => {
    return PROTECTED_NO_REDIRECT.some(path => 
      pathname.startsWith(path)
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
          if (currentPath === "/auth" && !isProtectedNoRedirect(currentPath)) {
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

    // Initial session check with retry mechanism
    const checkInitialSession = async (retryCount = 0) => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          if (retryCount < 3) {
            console.log("[Auth] Retrying session check...");
            setTimeout(() => checkInitialSession(retryCount + 1), 1000);
            return;
          }
          console.error("[Auth] Session check error:", error);
          handleSessionError(error);
          return;
        }

        if (!session) {
          if (!isPublicPath(currentPath) && !isProtectedNoRedirect(currentPath)) {
            console.log("[Auth] No session and not on public/protected path - redirecting to auth");
            await safeNavigate("/auth");
          }
          return;
        }

        // Only redirect to dashboard if on auth page and not accessing protected routes
        if (currentPath === "/auth" && !isProtectedNoRedirect(currentPath)) {
          console.log("[Auth] Valid session on auth page - redirecting to dashboard");
          await safeNavigate("/dashboard");
        }
      } catch (error) {
        if (retryCount < 3) {
          console.log("[Auth] Retrying after error...");
          setTimeout(() => checkInitialSession(retryCount + 1), 1000);
          return;
        }
        console.error("[Auth] Initial session check error:", error);
        handleSessionError(error);
      }
    };

    checkInitialSession();

    // Session refresh with improved error handling
    sessionRefreshInterval = setInterval(async () => {
      try {
        const session = await refreshSession();
        if (!session && !isPublicPath(currentPath) && !isProtectedNoRedirect(currentPath)) {
          console.log("[Auth] Session refresh failed - redirecting to auth");
          await safeNavigate("/auth");
        }
      } catch (error) {
        console.error("[Auth] Refresh error:", error);
        handleSessionError(error);
      }
    }, 2 * 60 * 1000);

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