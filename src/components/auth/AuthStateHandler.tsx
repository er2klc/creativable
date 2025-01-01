import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useSessionManagement } from "@/hooks/auth/use-session-management";
import { AuthChangeEvent } from "@supabase/supabase-js";

const PUBLIC_ROUTES = ["/", "/auth", "/register", "/privacy-policy", "/auth/data-deletion/instagram"];

export const AuthStateHandler = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { handleSessionError, refreshSession } = useSessionManagement();

  useEffect(() => {
    let subscription: { unsubscribe: () => void } | null = null;
    
    const setupAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
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
            }
          }
        );

        subscription = authSubscription;

        // Initial route check
        if (!session && !PUBLIC_ROUTES.includes(location.pathname)) {
          navigate("/auth");
        }
      } catch (error) {
        console.error("[Auth] Setup error:", error);
        handleSessionError(error);
      }
    };

    setupAuth();

    // Set up session refresh interval
    const refreshInterval = setInterval(refreshSession, 10 * 60 * 1000); // Every 10 minutes

    return () => {
      console.log("[Auth] Cleaning up auth listener");
      subscription?.unsubscribe();
      clearInterval(refreshInterval);
    };
  }, [navigate, location.pathname, handleSessionError, refreshSession]);

  return null;
};