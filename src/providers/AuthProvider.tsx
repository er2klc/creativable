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
    const publicPaths = ["/", "/auth", "/register", "/privacy-policy", "/auth/data-deletion/instagram"];
    let subscription: any = null;
    
    const setupAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          setUser(session.user);
          setIsAuthenticated(true);
          if (location.pathname === "/auth" || location.pathname === "/register") {
            navigate("/dashboard");
          }
        } else if (!publicPaths.includes(location.pathname)) {
          navigate("/auth");
        }

        const { data: { subscription: authSubscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
          console.log("[Auth] Auth state changed:", event, session?.user?.id);

          if (event === "SIGNED_IN") {
            if (session?.user) {
              setUser(session.user);
              setIsAuthenticated(true);
              navigate("/dashboard");
            }
          } else if (event === "SIGNED_OUT") {
            setUser(null);
            setIsAuthenticated(false);
            navigate("/auth");
          } else if (event === "TOKEN_REFRESHED") {
            if (session?.user) {
              setUser(session.user);
              setIsAuthenticated(true);
            }
          }
        });

        subscription = authSubscription;
      } catch (error: any) {
        console.error("[Auth] Setup error:", error);
        if (!publicPaths.includes(location.pathname)) {
          toast.error("Sitzung abgelaufen. Bitte erneut anmelden.");
          navigate("/auth");
        }
      } finally {
        setIsLoading(false);
      }
    };

    setupAuth();

    // Refresh session every 4 minutes to prevent expiration
    const refreshInterval = setInterval(async () => {
      try {
        const { data: { session }, error } = await supabase.auth.refreshSession();
        if (error) {
          console.error("[Auth] Session refresh error:", error);
          if (!publicPaths.includes(location.pathname)) {
            toast.error("Sitzung abgelaufen. Bitte erneut anmelden.");
            navigate("/auth");
          }
          return;
        }
        
        if (session?.user) {
          setUser(session.user);
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error("[Auth] Session refresh error:", error);
      }
    }, 4 * 60 * 1000); // 4 minutes

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