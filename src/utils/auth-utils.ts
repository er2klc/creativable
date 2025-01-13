import { toast } from "sonner";
import { NavigateFunction } from "react-router-dom";

export const isTokenExpired = (error: any) => 
  error?.message?.includes("JWT expired") ||
  error?.message?.includes("invalid JWT") ||
  error?.message?.includes("token is expired") ||
  error?.status === 401;

export const handleSessionExpiration = (
  pathname: string,
  protectedPaths: string[],
  navigate: NavigateFunction,
  setUser: (user: any) => void,
  setIsAuthenticated: (value: boolean) => void
) => {
  setUser(null);
  setIsAuthenticated(false);
  
  if (protectedPaths.includes(pathname)) {
    toast.error("Ihre Sitzung ist abgelaufen. Bitte melden Sie sich erneut an.");
    navigate("/auth", { 
      replace: true,
      state: { 
        returnTo: pathname,
        sessionExpired: true 
      }
    });
  }
};