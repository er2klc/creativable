import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const useSessionManagement = () => {
  const navigate = useNavigate();

  const handleSessionError = async (error: any) => {
    console.error("[Auth] Session error:", error);

    if (error?.code === "session_not_found") {
      console.error("[Auth] Session not found, redirecting to login.");
      toast.error("Ihre Sitzung ist abgelaufen. Bitte melden Sie sich erneut an.");
      await supabase.auth.signOut();
      navigate("/auth");
      return;
    }

    // Handle other auth errors
    toast.error("Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.");
  };

  const refreshSession = async () => {
    try {
      const { error } = await supabase.auth.refreshSession();
      if (error) {
        console.error("[Auth] Token refresh failed:", error);
        await handleSessionError(error);
      }
    } catch (error) {
      await handleSessionError(error);
    }
  };

  return {
    handleSessionError,
    refreshSession,
  };
};