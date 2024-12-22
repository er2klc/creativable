import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useSettings } from "@/hooks/use-settings";

export function useLinkedInConnection() {
  const { toast } = useToast();
  const { settings, refetchSettings } = useSettings();
  const redirectUri = `${window.location.origin}/auth/callback/linkedin`;
  const isConnected = settings?.linkedin_connected === true;

  const connectLinkedIn = useCallback(async (clientId: string) => {
    try {
      if (!clientId) {
        throw new Error("Bitte speichern Sie zuerst Ihre LinkedIn Client ID");
      }

      // Using only the available LinkedIn OAuth scopes
      const scope = "openid profile email w_member_social";
      const state = Math.random().toString(36).substring(7);
      localStorage.setItem("linkedin_oauth_state", state);
      
      const linkedInAuthUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}&scope=${encodeURIComponent(scope)}`;
      
      console.log("Redirecting to:", linkedInAuthUrl);
      
      window.location.href = linkedInAuthUrl;
    } catch (error) {
      console.error("Error initiating LinkedIn connection:", error);
      toast({
        title: "Fehler ❌",
        description: error.message,
        variant: "destructive",
      });
    }
  }, [redirectUri, toast]);

  const disconnectLinkedIn = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Kein Benutzer gefunden");

      const { error: disconnectError } = await supabase
        .from('platform_auth_status')
        .update({
          is_connected: false,
          access_token: null,
          expires_at: null,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id)
        .eq('platform', 'linkedin');

      if (disconnectError) throw disconnectError;

      const { error: settingsError } = await supabase
        .from('settings')
        .update({ linkedin_connected: false })
        .eq('user_id', user.id);

      if (settingsError) throw settingsError;

      await refetchSettings();

      toast({
        title: "Erfolg ✨",
        description: "LinkedIn Verbindung erfolgreich getrennt",
      });

    } catch (error) {
      console.error("Error disconnecting LinkedIn:", error);
      toast({
        title: "Fehler ❌",
        description: "Fehler beim Trennen der LinkedIn Verbindung",
        variant: "destructive",
      });
    }
  };

  return {
    isConnected,
    redirectUri,
    connectLinkedIn,
    disconnectLinkedIn
  };
}