import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useSessionManagement } from "@/hooks/auth/use-session-management";
import { AuthChangeEvent } from "@supabase/supabase-js";
import { toast } from "sonner";

const PUBLIC_ROUTES = ["/", "/auth", "/register", "/privacy-policy", "/auth/data-deletion/instagram"];

export const AuthStateHandler = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { handleSessionError, refreshSession } = useSessionManagement();

  useEffect(() => {
    let subscription: { unsubscribe: () => void } | null = null;
    let refreshInterval: NodeJS.Timeout;
    
    const setupAuth = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error("[Auth] Session error:", sessionError);
          throw sessionError;
        }
        
        // Set up auth state listener
        const { data: { subscription: authSubscription } } = supabase.auth.onAuthStateChange(
          async (event: AuthChangeEvent, currentSession) => {
            console.log("[Auth] State changed:", event);

            if (event === "SIGNED_IN") {
              if (location.pathname === "/auth") {
                navigate("/dashboard");
              }
            } else if (event === "SIGNED_OUT") {
              if (!PUBLIC_ROUTES.includes(location.pathname)) {
                navigate("/auth");
              }
            } else if (event === "TOKEN_REFRESHED") {
              console.log("[Auth] Token refreshed successfully");
            }
          }
        );

        subscription = authSubscription;

        // Initial route check
        if (!session && !PUBLIC_ROUTES.includes(location.pathname)) {
          navigate("/auth");
        }

        // Set up session refresh interval
        refreshInterval = setInterval(async () => {
          try {
            const { error: refreshError } = await refreshSession();
            if (refreshError) {
              console.error("[Auth] Session refresh error:", refreshError);
              if (!PUBLIC_ROUTES.includes(location.pathname)) {
                toast.error("Ihre Sitzung ist abgelaufen. Bitte melden Sie sich erneut an.");
                navigate("/auth");
              }
            }
          } catch (error) {
            console.error("[Auth] Session refresh error:", error);
            handleSessionError(error);
          }
        }, 4 * 60 * 1000); // Refresh every 4 minutes

      } catch (error) {
        console.error("[Auth] Setup error:", error);
        handleSessionError(error);
      }
    };

    setupAuth();

    return () => {
      console.log("[Auth] Cleaning up auth listener");
      subscription?.unsubscribe();
      clearInterval(refreshInterval);
    };
  }, [navigate, location.pathname, handleSessionError, refreshSession]);

  return null;
};