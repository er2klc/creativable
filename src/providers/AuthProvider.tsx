
import { ReactNode, useEffect, useState } from "react";
import { AuthContext } from "./auth/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const navigate = useNavigate();
  const isAuthenticated = !!user;

  useEffect(() => {
    const checkUser = async () => {
      try {
        setIsLoading(true);
        const { data: { user }, error } = await supabase.auth.getUser();

        if (error) {
          throw error;
        }

        setUser(user);
      } catch (error) {
        console.error("Error checking user session:", error);
        setError(error as Error);
        toast.error("There was a problem with your authentication. Please log in again.");
      } finally {
        setIsLoading(false);
      }
    };

    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === "SIGNED_IN" && session?.user) {
          setUser(session.user);
          navigate('/dashboard');
        } else if (event === "SIGNED_OUT") {
          setUser(null);
          navigate('/auth');
        } else if (event === "USER_UPDATED" && session?.user) {
          setUser(session.user);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  return (
    <AuthContext.Provider value={{ user, isLoading, isAuthenticated, error: error as Error }}>
      {children}
    </AuthContext.Provider>
  );
};
