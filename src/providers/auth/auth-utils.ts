import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { NavigateFunction } from "react-router-dom";

export const handleSessionError = async (
  error: any,
  setIsAuthenticated: (value: boolean) => void,
  navigate: NavigateFunction,
  publicPaths: string[],
  pathname: string
) => {
  // Clear any potentially corrupted auth state
  await supabase.auth.signOut();
  setIsAuthenticated(false);

  // Check if it's a session expiration error
  if (error?.message?.includes("session_not_found") || error?.error?.message?.includes("session_not_found")) {
    toast.error("Ihre Sitzung ist abgelaufen. Bitte melden Sie sich erneut an.");
  } else {
    toast.error("Ein Fehler ist aufgetreten. Bitte melden Sie sich erneut an.");
  }

  // Only redirect if not already on a public path
  if (!publicPaths.includes(pathname)) {
    navigate("/auth");
  }
};

export const refreshSession = async () => {
  try {
    const { error } = await supabase.auth.refreshSession();
    if (error) {
      console.error("[Auth] Session refresh failed:", error);
      if (error.message?.includes("expired_token")) {
        console.error("[Auth] Token expired, user needs to log in again.");
      }
      throw error;
    }
  } catch (error) {
    console.error("[Auth] Error during session refresh:", error);
    throw error;
  }
};