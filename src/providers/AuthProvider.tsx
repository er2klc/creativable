import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const publicPaths = ["/", "/auth", "/privacy-policy", "/auth/data-deletion/instagram"];
    let authListener: any = null;
    
    const setupAuth = async () => {
      try {
        // Initial session check
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error("[Auth] Session error:", sessionError);
          // Clear any invalid session data
          await supabase.auth.signOut();
          if (!publicPaths.includes(location.pathname)) {
            navigate("/auth");
          }
          return;
        }

        console.log("[Auth] Initial session check:", session?.user?.id);
        
        if (session) {
          // Verify user exists
          const { data: { user }, error: userError } = await supabase.auth.getUser();
          
          if (userError || !user) {
            console.error("[Auth] Invalid user detected:", userError);
            await supabase.auth.signOut();
            if (!publicPaths.includes(location.pathname)) {
              navigate("/auth");
            }
            return;
          }

          setIsAuthenticated(true);
          if (location.pathname === "/auth") {
            navigate("/dashboard");
          }
        } else if (!publicPaths.includes(location.pathname)) {
          console.log("[Auth] No session, redirecting to auth from:", location.pathname);
          navigate("/auth");
        }

        // Setup auth state listener
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
          console.log("[Auth] Auth state changed:", event, session?.user?.id);

          if (event === "SIGNED_IN") {
            // Verify user exists after sign in
            const { data: { user }, error: userError } = await supabase.auth.getUser();
            
            if (userError || !user) {
              console.error("[Auth] Invalid user after sign in:", userError);
              await supabase.auth.signOut();
              navigate("/auth");
              return;
            }

            setIsAuthenticated(true);
            console.log("[Auth] User signed in, redirecting to dashboard");
            navigate("/dashboard");
          } else if (event === "SIGNED_OUT") {
            setIsAuthenticated(false);
            console.log("[Auth] User signed out, redirecting to auth");
            navigate("/auth");
          } else if (event === "TOKEN_REFRESHED") {
            // Verify user still exists when token is refreshed
            const { data: { user }, error: userError } = await supabase.auth.getUser();
            
            if (userError || !user) {
              console.error("[Auth] Invalid user after token refresh:", userError);
              await supabase.auth.signOut();
              navigate("/auth");
              return;
            }

            console.log("[Auth] Token refreshed for user:", session?.user?.id);
            setIsAuthenticated(true);
          }
        });

        authListener = subscription;
      } catch (error: any) {
        console.error("[Auth] Setup error:", error);
        // Clear any potentially corrupted auth state
        await supabase.auth.signOut();
        toast.error("Ein Fehler ist aufgetreten. Bitte melden Sie sich erneut an.");
      } finally {
        setIsLoading(false);
      }
    };

    setupAuth();

    return () => {
      console.log("[Auth] Cleaning up auth listener");
      if (authListener) {
        authListener.unsubscribe();
      }
    };
  }, [navigate, location.pathname]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    );
  }

  return <>{children}</>;
};