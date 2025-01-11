import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const useSessionManagement = () => {
  const navigate = useNavigate();

  const handleSessionError = async (error: any) => {
    console.error("[Auth] Session error:", error);

    if (error?.message?.includes("session_not_found") || 
        error?.message?.includes("JWT expired") ||
        error?.message?.includes("token is expired") ||
        error?.message?.includes("Failed to fetch")) {
      
      try {
        await supabase.auth.signOut();
      } catch (signOutError) {
        console.error("[Auth] Sign out error:", signOutError);
      }
      
      toast.error("Ihre Sitzung ist abgelaufen. Bitte melden Sie sich erneut an.");
      navigate("/auth");
      return;
    }

    toast.error("Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.");
  };

  const refreshSession = async () => {
    try {
      const { data: { session }, error } = await supabase.auth.refreshSession();
      if (error) {
        console.error("[Auth] Refresh session error:", error);
        throw error;
      }
      return { session, error: null };
    } catch (error) {
      console.error("[Auth] Session refresh error:", error);
      return { session: null, error };
    }
  };

  return {
    handleSessionError,
    refreshSession,
  };
};