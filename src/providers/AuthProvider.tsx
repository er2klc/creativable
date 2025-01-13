import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { AuthContext } from "./auth/AuthContext";
import { toast } from "sonner";

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const publicPaths = [
      "/", 
      "/auth", 
      "/register", 
      "/privacy-policy", 
      "/auth/data-deletion/instagram",
      "/impressum",
      "/changelog",
      "/unity",
      "/elevate",
      "/unity/team"
    ];
    
    const protectedPaths = [
      "/dashboard",
      "/settings",
      "/leads",
      "/messages",
      "/calendar"
    ];
    
    let subscription: any = null;
    
    const handleAuthError = (error: any) => {
      console.error("[Auth] Error:", error);
      
      // Check for JWT expiration or invalid token
      const isTokenExpired = 
        error?.message?.includes("JWT expired") ||
        error?.message?.includes("invalid JWT") ||
        error?.message?.includes("token is expired") ||
        error?.status === 401;

      if (isTokenExpired) {
        setUser(null);
        setIsAuthenticated(false);
        
        // Only show toast and redirect if on a protected path
        if (protectedPaths.includes(location.pathname)) {
          toast.error("Ihre Sitzung ist abgelaufen. Bitte melden Sie sich erneut an.");
          navigate("/auth", { 
            replace: true,
            state: { 
              returnTo: location.pathname,
              sessionExpired: true 
            }
          });
        }
      }
    };
    
    const setupAuth = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          handleAuthError(sessionError);
          return;
        }
        
        if (session?.user) {
          setUser(session.user);
          setIsAuthenticated(true);
          
          // Only redirect to dashboard if on auth page
          if (location.pathname === "/auth") {
            navigate("/dashboard");
          }
        } else {
          // Only redirect to auth if trying to access protected paths
          if (protectedPaths.includes(location.pathname)) {
            navigate("/auth");
          }
        }

        const { data: { subscription: authSubscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
          console.log("[Auth] Auth state changed:", event, session?.user?.id);

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

        subscription = authSubscription;
      } catch (error: any) {
        handleAuthError(error);
      } finally {
        setIsLoading(false);
      }
    };

    setupAuth();

    // Refresh session every 2 minutes to prevent expiration
    const refreshInterval = setInterval(async () => {
      try {
        const { data: { session }, error } = await supabase.auth.refreshSession();
        if (error) {
          handleAuthError(error);
          return;
        }
        
        if (session?.user) {
          setUser(session.user);
          setIsAuthenticated(true);
        }
      } catch (error) {
        handleAuthError(error);
      }
    }, 2 * 60 * 1000); // 2 minutes

    return () => {
      console.log("[Auth] Cleaning up auth listener");
      if (subscription) {
        subscription.unsubscribe();
      }
      clearInterval(refreshInterval);
    };
  }, [navigate, location.pathname]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, user }}>
      {children}
    </AuthContext.Provider>
  );
};