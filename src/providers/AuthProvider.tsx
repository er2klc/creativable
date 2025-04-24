import { useEffect, useState, useCallback, memo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { AuthContext } from "./auth/AuthContext";
import { useSessionRefresh } from "@/hooks/auth/use-session-refresh";
import { useAuthState } from "@/hooks/auth/use-auth-state";
import { isTokenExpired, handleSessionExpiration } from "@/utils/auth-utils";

// Konstanten außerhalb der Komponente definieren für bessere Performance
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

export const AuthProvider = memo(({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  
  useSessionRefresh(protectedPaths, setUser, setIsAuthenticated);
  useAuthState(setUser, setIsAuthenticated);
  
  // Optimierter Setup mit useCallback
  const setupAuth = useCallback(async () => {
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        if (isTokenExpired(sessionError)) {
          handleSessionExpiration(
            location.pathname,
            protectedPaths,
            navigate,
            setUser,
            setIsAuthenticated
          );
        }
        setIsLoading(false);
        return;
      }
      
      if (session?.user) {
        setUser(session.user);
        setIsAuthenticated(true);
        
        if (location.pathname === "/auth") {
          navigate("/dashboard");
        }
      } else {
        if (protectedPaths.includes(location.pathname)) {
          navigate("/auth");
        }
      }
    } catch (error: any) {
      console.error("[Auth] Setup error:", error);
      if (isTokenExpired(error)) {
        handleSessionExpiration(
          location.pathname,
          protectedPaths,
          navigate,
          setUser,
          setIsAuthenticated
        );
      }
    } finally {
      setIsLoading(false);
    }
  }, [location.pathname, navigate]);

  useEffect(() => {
    setupAuth();
  }, [setupAuth]);

  // Optimierter Loading Spinner 
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#0A0A0A]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white" />
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, user }}>
      {children}
    </AuthContext.Provider>
  );
});