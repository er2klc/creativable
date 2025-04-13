import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { isTokenExpired, handleSessionExpiration } from "@/utils/auth-utils";

export const useSessionRefresh = (
  protectedPaths: string[],
  setUser: (user: any) => void,
  setIsAuthenticated: (value: boolean) => void
) => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const refreshInterval = setInterval(async () => {
      try {
        const { data: { session }, error } = await supabase.auth.refreshSession();
        if (error) {
          if (isTokenExpired(error)) {
            handleSessionExpiration(
              location.pathname,
              protectedPaths,
              navigate,
              setUser,
              setIsAuthenticated
            );
          }
          return;
        }
        
        if (session?.user) {
          setUser(session.user);
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error("[Auth] Session refresh error:", error);
        if (isTokenExpired(error)) {
          handleSessionExpiration(
            location.pathname,
            protectedPaths,
            navigate,
            setUser,
            setIsAuthenticated
          );
        }
      }
    }, 2 * 60 * 1000); // 2 minutes

    return () => clearInterval(refreshInterval);
  }, [location.pathname, navigate, protectedPaths, setIsAuthenticated, setUser]);
};