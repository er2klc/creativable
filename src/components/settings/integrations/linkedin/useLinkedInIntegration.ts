import { useState, useEffect } from "react";
import { useSettings } from "@/hooks/use-settings";
import { useToast } from "@/hooks/use-toast";
import { loadLinkedInCredentials, updatePlatformAuthStatus } from "./db/linkedInDb";
import { exchangeCodeForToken, revokeLinkedInToken } from "./api/linkedInApi";
import { supabase } from "@/integrations/supabase/client";

export function useLinkedInIntegration() {
  const { settings, updateSettings } = useSettings();
  const { toast } = useToast();
  const [clientId, setClientId] = useState("");
  const [clientSecret, setClientSecret] = useState("");
  const [error, setError] = useState<string>();
  const redirectUri = `${window.location.origin}/auth/callback/linkedin`;
  const isConnected = settings?.linkedin_connected === true || settings?.linkedin_connected === 'true';

  useEffect(() => {
    const loadSavedCredentials = async () => {
      const platformAuth = await loadLinkedInCredentials();
      if (platformAuth) {
        setClientId(platformAuth.auth_token || '');
        setClientSecret(platformAuth.refresh_token || '');
      }
    };

    loadSavedCredentials();
  }, []);

  const handleUpdateCredentials = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(undefined);
    
    if (!clientId || !clientSecret) {
      setError("Bitte füllen Sie alle Felder aus");
      toast({
        title: "Fehlende Eingaben",
        description: "Bitte füllen Sie alle Felder aus",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error: secretError } = await supabase
        .from('platform_auth_status')
        .upsert({
          user_id: (await supabase.auth.getUser()).data.user?.id,
          platform: 'linkedin',
          auth_token: clientId,
          refresh_token: clientSecret,
          is_connected: false,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,platform'
        });

      if (secretError) throw secretError;

      toast({
        title: "Erfolg",
        description: "LinkedIn Zugangsdaten wurden gespeichert",
      });
    } catch (error) {
      console.error('Error saving LinkedIn credentials:', error);
      setError("LinkedIn Zugangsdaten konnten nicht gespeichert werden");
      toast({
        title: "Fehler",
        description: "LinkedIn Zugangsdaten konnten nicht gespeichert werden",
        variant: "destructive",
      });
    }
  };

  const connectLinkedIn = async () => {
    try {
      setError(undefined);
      
      if (!clientId || !clientSecret) {
        setError("Bitte speichern Sie zuerst Ihre LinkedIn Zugangsdaten");
        toast({
          title: "Fehler",
          description: "Bitte speichern Sie zuerst Ihre LinkedIn Zugangsdaten",
          variant: "destructive",
        });
        return;
      }

      const scope = [
        "openid",
        "profile",
        "email",
        "w_member_social"
      ].join(" ");
      
      const state = Math.random().toString(36).substring(7);
      localStorage.setItem("linkedin_oauth_state", state);
      
      const linkedInAuthUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}&scope=${encodeURIComponent(scope)}&prompt=consent`;
      
      window.location.href = linkedInAuthUrl;
    } catch (error) {
      console.error("Error connecting to LinkedIn:", error);
      setError("Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.");
      toast({
        title: "Fehler bei der LinkedIn-Verbindung",
        description: "Bitte versuchen Sie es später erneut",
        variant: "destructive",
      });
    }
  };

  const disconnectLinkedIn = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const platformAuth = await loadLinkedInCredentials();
      
      if (platformAuth?.access_token) {
        await revokeLinkedInToken(
          platformAuth.access_token,
          clientId,
          clientSecret
        );
      }

      await updatePlatformAuthStatus(user.id, {
        is_connected: false,
        access_token: null,
        refresh_token: null,
        expires_at: null
      });

      // Update settings
      await updateSettings('linkedin_connected', 'false');
      await updateSettings('linkedin_auth_token', null);

      toast({
        title: "Erfolg",
        description: "LinkedIn wurde erfolgreich getrennt",
      });
    } catch (error) {
      console.error("Error disconnecting LinkedIn:", error);
      toast({
        title: "Fehler",
        description: "LinkedIn konnte nicht getrennt werden",
        variant: "destructive",
      });
    }
  };

  const copyRedirectUri = () => {
    navigator.clipboard.writeText(redirectUri);
    toast({
      title: "Kopiert!",
      description: "Redirect URI wurde in die Zwischenablage kopiert",
    });
  };

  return {
    clientId,
    setClientId,
    clientSecret,
    setClientSecret,
    redirectUri,
    isConnected,
    error,
    handleUpdateCredentials,
    connectLinkedIn,
    disconnectLinkedIn,
    copyRedirectUri,
  };
}