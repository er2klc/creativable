import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const [isSessionChecked, setIsSessionChecked] = useState(false);
  const [hasSession, setHasSession] = useState(false);
  const location = useLocation();

  useEffect(() => {
    let mounted = true;
    
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (mounted) {
          const hasValidSession = !!session;
          setHasSession(hasValidSession);
          setIsSessionChecked(true);
          console.log("[Auth] Session check:", { 
            hasSession: hasValidSession, 
            isAuthenticated,
            userId: session?.user?.id,
            path: location.pathname,
            timestamp: new Date().toISOString()
          });
        }
      } catch (error) {
        console.error("[Auth] Session check error:", error);
        if (mounted) {
          setIsSessionChecked(true);
          setHasSession(false);
        }
      }
    };

    // Only check session if not already authenticated
    if (!isAuthenticated && !isSessionChecked) {
      checkSession();
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (mounted) {
        const hasValidSession = !!session;
        setHasSession(hasValidSession);
        console.log("[Auth] Auth state changed in ProtectedRoute:", { 
          event, 
          hasSession: hasValidSession,
          userId: session?.user?.id,
          path: location.pathname,
          timestamp: new Date().toISOString()
        });
      }
    });
    
    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [isAuthenticated, location.pathname, isSessionChecked]);

  if (isLoading || !isSessionChecked) {
    return null;
  }

  if (!isAuthenticated && !hasSession) {
    return <Navigate to="/auth" replace state={{ from: location }} />;
  }

  return <>{children}</>;
};