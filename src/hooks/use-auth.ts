import { useContext, useEffect, useState } from "react";
import { AuthContext } from "@/providers/auth/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

export const useAuth = () => {
  const context = useContext(AuthContext);
  const navigate = useNavigate();
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      try {
        console.log("[Auth] Checking session...");
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("[Auth] Session check error:", error);
          setIsCheckingSession(false);
          return false;
        }

        console.log("[Auth] Session check result:", {
          hasSession: !!session,
          userId: session?.user?.id,
          path: window.location.pathname,
          timestamp: new Date().toISOString(),
        });

        setIsCheckingSession(false);
        return !!session;
      } catch (error) {
        console.error("[Auth] Session check error:", error);
        setIsCheckingSession(false);
        return false;
      }
    };

    checkSession();
  }, []);

  if (!context) {
    console.error("[Auth] Auth context not found");
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return {
    ...context,
    isLoading: context.isLoading || isCheckingSession
  };
};