import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { exchangeCodeForToken } from "@/components/settings/integrations/linkedin/api/linkedInApi";
import { updatePlatformAuthStatus } from "@/components/settings/integrations/linkedin/db/linkedInDb";

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

      try {
        if (error || errorDescription) {
          console.error("LinkedIn OAuth error:", error, errorDescription);
          throw new Error(errorDescription || "Die Authentifizierung konnte nicht abgeschlossen werden.");
        }

        if (!state || state !== storedState) {
          console.error("State mismatch:", { state, storedState });
          throw new Error("Sicherheitsfehler: Die Authentifizierung konnte nicht abgeschlossen werden.");
        }

        if (!code) {
          throw new Error("Kein Autorisierungscode erhalten");
        }

        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          throw new Error("Keine aktive Sitzung gefunden");
        }

        const tokenData = await exchangeCodeForToken(code, `${window.location.origin}/auth/callback/linkedin`);
        if (!tokenData || !tokenData.access_token) {
          throw new Error("Keine gültigen Zugangsdaten von LinkedIn erhalten");
        }

        await updatePlatformAuthStatus(session.user.id, {
          is_connected: true,
          access_token: tokenData.access_token,
          expires_at: new Date(Date.now() + tokenData.expires_in * 1000).toISOString()
        });

        const { error: settingsError } = await supabase
          .from('settings')
          .update({ 
            linkedin_connected: true,
            linkedin_auth_token: tokenData.access_token,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', session.user.id);

        if (settingsError) throw settingsError;

        toast({
          title: "Erfolg!",
          description: "LinkedIn wurde erfolgreich verbunden.",
        });
      } catch (error) {
        console.error("LinkedIn callback error:", error);
        toast({
          title: "Fehler",
          description: error instanceof Error ? error.message : "Die LinkedIn-Verbindung konnte nicht hergestellt werden.",
          variant: "destructive",
        });
      } finally {
        localStorage.removeItem("linkedin_oauth_state");
        navigate("/settings");
      }
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