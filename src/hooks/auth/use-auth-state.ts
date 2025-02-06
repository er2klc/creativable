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
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      
      if (event === "SIGNED_IN") {
        if (session?.user) {
          setUser(session.user);
          setIsAuthenticated(true);
          if (location.pathname === "/auth") {
            navigate("/dashboard");
          }
        }
      } else if (event === "SIGNED_OUT" || event === "TOKEN_REFRESHED") {
        if (!session?.user) {
          setUser(null);
          setIsAuthenticated(false);
          navigate("/auth");
        } else {
          setUser(session.user);
          setIsAuthenticated(true);
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate, setIsAuthenticated, setUser]);
};
