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
          localStorage.removeItem('dailyQuote');
          localStorage.removeItem('dailyQuoteDate');
          
          if (!isPublicPath(currentPath)) {
            toast.error("Ihre Sitzung wurde beendet. Bitte melden Sie sich erneut an.");
            await navigate("/auth");
          }
        }
      } catch (error) {
        console.error("[Auth] Navigation error:", error);
        handleSessionError(error);
      }
    };

    const setupAuth = async () => {
      try {
        // Get initial session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) throw sessionError;

        if (!session) {
          if (!isPublicPath(currentPath) && !isProtectedNoRedirect(currentPath)) {
            console.log("[Auth] No session - redirecting to auth");
            await navigate("/auth");
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
              await navigate("/auth");
            }
          } catch (error) {
            console.error("[Auth] Session refresh error:", error);
            handleSessionError(error);
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
        console.error("[Auth] Setup error:", error);
        handleSessionError(error);
      }
    };

    setupAuth();
  }, [navigate, location.pathname, handleSessionError, refreshSession]);

  return null;
};