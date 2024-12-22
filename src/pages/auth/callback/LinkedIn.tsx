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
      const error = params.get("error");
      const errorDescription = params.get("error_description");
      const storedState = localStorage.getItem("linkedin_oauth_state");

      // Handle LinkedIn OAuth errors
      if (error || errorDescription) {
        console.error("LinkedIn OAuth error:", error, errorDescription);
        toast({
          title: "LinkedIn Fehler",
          description: errorDescription || "Die Authentifizierung konnte nicht abgeschlossen werden.",
          variant: "destructive",
        });
        navigate("/settings");
        return;
      }

      // Verify state to prevent CSRF attacks
      if (state !== storedState) {
        console.error("State mismatch:", { state, storedState });
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
          
          // Get the session token for authorization
          const { data: { session } } = await supabase.auth.getSession();
          if (!session) {
            throw new Error("No active session found");
          }

          // Call Supabase Edge Function to handle OAuth token exchange
          const { data, error } = await supabase.functions.invoke("linkedin-auth-callback", {
            body: { 
              code, 
              redirect_uri: `${window.location.origin}/auth/callback/linkedin` 
            },
            headers: {
              Authorization: `Bearer ${session.access_token}`
            }
          });

          if (error) {
            console.error("LinkedIn callback error:", error);
            throw error;
          }

          toast({
            title: "Erfolg!",
            description: "LinkedIn wurde erfolgreich verbunden.",
          });
        } catch (error) {
          console.error("LinkedIn callback error:", error);
          toast({
            title: "Fehler",
            description: "Die LinkedIn-Verbindung konnte nicht hergestellt werden. Bitte überprüfen Sie die App-Einstellungen in der LinkedIn Developer Console.",
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
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mb-4" />
      <p className="text-center text-gray-600">
        Verbindung mit LinkedIn wird hergestellt...
      </p>
    </div>
  );
}