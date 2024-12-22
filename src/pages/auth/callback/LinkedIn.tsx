import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export default function LinkedInCallback() {
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const handleCallback = async () => {
      const params = new URLSearchParams(window.location.search);
      const code = params.get("code");
      const state = params.get("state");
      const storedState = localStorage.getItem("linkedin_oauth_state");

      // Verify state to prevent CSRF attacks
      if (state !== storedState) {
        toast({
          title: "Sicherheitsfehler",
          description: "Die Authentifizierung konnte nicht abgeschlossen werden.",
          variant: "destructive",
        });
        navigate("/settings");
        return;
      }

      if (code) {
        try {
          console.log("Processing LinkedIn callback with code:", code);
          
          // Call Supabase Edge Function to handle OAuth token exchange
          const { data, error } = await supabase.functions.invoke("linkedin-auth-callback", {
            body: { code, redirect_uri: `${window.location.origin}/auth/callback/linkedin` }
          });

          if (error) throw error;

          // Update settings to mark LinkedIn as connected
          const { error: updateError } = await supabase
            .from("settings")
            .update({ linkedin_connected: true })
            .eq("user_id", (await supabase.auth.getUser()).data.user?.id);

          if (updateError) throw updateError;

          toast({
            title: "Erfolg!",
            description: "LinkedIn wurde erfolgreich verbunden.",
          });
        } catch (error) {
          console.error("LinkedIn callback error:", error);
          toast({
            title: "Fehler",
            description: "Die LinkedIn-Verbindung konnte nicht hergestellt werden.",
            variant: "destructive",
          });
        }
      }

      // Clean up
      localStorage.removeItem("linkedin_oauth_state");
      navigate("/settings");
    };

    handleCallback();
  }, [navigate, toast]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
    </div>
  );
}