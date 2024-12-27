import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const publicPaths = ["/", "/auth", "/privacy-policy", "/auth/data-deletion/instagram"];
    
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        console.log("Current session:", session?.user?.id);
        
        if (!session && !publicPaths.includes(location.pathname)) {
          console.log("No active session found, redirecting to auth");
          toast.error("Bitte melden Sie sich an, um fortzufahren.");
          navigate("/auth");
        }
      } catch (error) {
        console.error("Session check error:", error);
        toast.error("Ein Fehler ist aufgetreten. Bitte laden Sie die Seite neu.");
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();
  }, [navigate, location.pathname]);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, session?.user?.id);

      if (event === "SIGNED_OUT") {
        console.log("User signed out, redirecting to auth");
        navigate("/auth");
        return;
      }

      if (event === "SIGNED_IN") {
        console.log("User signed in, redirecting to dashboard");
        navigate("/dashboard");
        return;
      }

      if (event === "TOKEN_REFRESHED") {
        console.log("Token refreshed successfully");
        return;
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    );
  }

  return <>{children}</>;
};