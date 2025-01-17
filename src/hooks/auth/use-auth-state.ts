import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";

export const useAuthState = (
  setUser: (user: User | null) => void,
  setIsAuthenticated: (value: boolean) => void
) => {
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    let initialSessionChecked = false;

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      console.log("[Auth] Auth state changed:", event, session?.user?.id);

      if (event === "SIGNED_IN") {
        if (session?.user) {
          setUser(session.user);
          setIsAuthenticated(true);
          if (location.pathname === "/auth") {
            navigate("/dashboard");
          }
        }
      } else if (event === "SIGNED_OUT") {
        setUser(null);
        setIsAuthenticated(false);
        navigate("/auth");
      } else if (event === "TOKEN_REFRESHED") {
        if (session?.user) {
          setUser(session.user);
          setIsAuthenticated(true);
        } else {
          setUser(null);
          setIsAuthenticated(false);
          navigate("/auth");
        }
      } else if (event === "INITIAL_SESSION" && !initialSessionChecked) {
        initialSessionChecked = true;
        if (session?.user) {
          setUser(session.user);
          setIsAuthenticated(true);
        } else {
          setUser(null);
          setIsAuthenticated(false);
          if (location.pathname !== "/auth") {
            navigate("/auth");
          }
        }
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [navigate, setIsAuthenticated, setUser]);
};