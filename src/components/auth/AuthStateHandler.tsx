import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useSessionManagement } from "@/hooks/auth/use-session-management";
import { AuthChangeEvent } from "@supabase/supabase-js";
import { toast } from "sonner";

const PUBLIC_PATHS = [
  "/",
  "/auth",
  "/register",
  "/privacy-policy",
  "/changelog",
  "/impressum"
];

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

  const handleAuthError = async (error: any) => {
    console.error("[Auth] Error:", error);

    // Clear all auth-related local storage
    localStorage.clear();

    // If it's a session not found error, handle it gracefully
    if (error?.message?.includes("session_not_found") || 
        error?.error?.message?.includes("session_not_found")) {
      await supabase.auth.signOut();
      if (!isPublicPath(location.pathname)) {
        toast.error("Ihre Sitzung ist abgelaufen. Bitte melden Sie sich erneut an.");
        navigate("/auth", { replace: true });
      }
      return;
    }

    // For other errors, show a generic message
    toast.error("Ein Fehler ist aufgetreten. Bitte melden Sie sich erneut an.");
    if (!isPublicPath(location.pathname)) {
      navigate("/auth", { replace: true });
    }
  };

  useEffect(() => {
    let sessionRefreshInterval: NodeJS.Timeout | null = null;
    const currentPath = location.pathname;

    const handleAuthChange = async (event: AuthChangeEvent, session: any) => {
      try {
        console.log("[Auth] State changed:", event, session?.user?.id);

        if (event === "SIGNED_IN") {
          if (currentPath === "/auth") {
            await navigate("/dashboard");
          }
        } else if (event === "SIGNED_OUT") {
          if (sessionRefreshInterval) {
            clearInterval(sessionRefreshInterval);
            sessionRefreshInterval = null;
          }
          
          // Clear all auth-related local storage
          localStorage.clear();
          
          if (!isPublicPath(currentPath)) {
            toast.error("Ihre Sitzung wurde beendet. Bitte melden Sie sich erneut an.");
            await navigate("/auth", { replace: true });
          }
        }
      } catch (error) {
        await handleAuthError(error);
      }
    };

    const setupAuth = async () => {
      try {
        // Get initial session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          await handleAuthError(sessionError);
          return;
        }

        if (!session) {
          if (!isPublicPath(currentPath) && !isProtectedNoRedirect(currentPath)) {
            console.log("[Auth] No session - redirecting to auth");
            await navigate("/auth", { replace: true });
          }
          return;
        }

        // Setup auth state change listener
        const { data: { subscription } } = supabase.auth.onAuthStateChange(handleAuthChange);

        // Setup session refresh
        sessionRefreshInterval = setInterval(async () => {
          try {
            const refreshedSession = await refreshSession();
            if (!refreshedSession && !isPublicPath(currentPath)) {
              toast.error("Ihre Sitzung ist abgelaufen. Bitte melden Sie sich erneut an.");
              await navigate("/auth", { replace: true });
            }
          } catch (error) {
            await handleAuthError(error);
          }
        }, 4 * 60 * 1000); // Refresh every 4 minutes

        return () => {
          console.log("[Auth] Cleaning up auth listener");
          subscription.unsubscribe();
          if (sessionRefreshInterval) {
            clearInterval(sessionRefreshInterval);
          }
        };
      } catch (error) {
        await handleAuthError(error);
      }
    };

    setupAuth();
  }, [navigate, location.pathname, handleSessionError, refreshSession]);

  return null;
};