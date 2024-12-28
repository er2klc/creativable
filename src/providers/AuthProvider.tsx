import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { AuthContext } from "./auth/AuthContext";
import { handleSessionError, refreshSession } from "./auth/auth-utils";

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const publicPaths = ["/", "/auth", "/privacy-policy", "/auth/data-deletion/instagram"];
    let subscription: any = null;
    
    const setupAuth = async () => {
      try {
        // Initial session check
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error("[Auth] Session error:", sessionError);
          await handleSessionError(sessionError, setIsAuthenticated, navigate, publicPaths, location.pathname);
          return;
        }

        console.log("[Auth] Initial session check:", session?.user?.id);
        
        if (session) {
          // Verify user exists
          const { data: { user }, error: userError } = await supabase.auth.getUser();
          
          if (userError || !user) {
            console.error("[Auth] Invalid user detected:", userError);
            await handleSessionError(userError, setIsAuthenticated, navigate, publicPaths, location.pathname);
            return;
          }

          setUser(user);
          setIsAuthenticated(true);
          if (location.pathname === "/auth") {
            navigate("/dashboard");
          }
        } else if (!publicPaths.includes(location.pathname)) {
          console.log("[Auth] No session, redirecting to auth from:", location.pathname);
          navigate("/auth");
        }

        // Setup auth state listener with automatic token refresh
        const { data: { subscription: authSubscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
          console.log("[Auth] Auth state changed:", event, session?.user?.id);

          if (event === "SIGNED_IN") {
            const { data: { user }, error: userError } = await supabase.auth.getUser();
            
            if (userError || !user) {
              console.error("[Auth] Invalid user after sign in:", userError);
              await handleSessionError(userError, setIsAuthenticated, navigate, publicPaths, location.pathname);
              return;
            }

            setUser(user);
            setIsAuthenticated(true);
            console.log("[Auth] User signed in, redirecting to dashboard");
            navigate("/dashboard");
          } else if (event === "SIGNED_OUT") {
            setUser(null);
            setIsAuthenticated(false);
            console.log("[Auth] User signed out, redirecting to auth");
            navigate("/auth");
          } else if (event === "TOKEN_REFRESHED") {
            // Verify user still exists when token is refreshed
            const { data: { user }, error: userError } = await supabase.auth.getUser();
            
            if (userError || !user) {
              console.error("[Auth] Invalid user after token refresh:", userError);
              await handleSessionError(userError, setIsAuthenticated, navigate, publicPaths, location.pathname);
              return;
            }

            setUser(user);
            console.log("[Auth] Token refreshed for user:", session?.user?.id);
            setIsAuthenticated(true);
          }
        });

        subscription = authSubscription;
      } catch (error: any) {
        console.error("[Auth] Setup error:", error);
        await handleSessionError(error, setIsAuthenticated, navigate, publicPaths, location.pathname);
      } finally {
        setIsLoading(false);
      }
    };

    // Attempt to refresh the session periodically (every 10 minutes)
    const refreshInterval = setInterval(async () => {
      try {
        await refreshSession();
      } catch (error) {
        await handleSessionError(error, setIsAuthenticated, navigate, publicPaths, location.pathname);
      }
    }, 10 * 60 * 1000); // 10 minutes

    setupAuth();

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