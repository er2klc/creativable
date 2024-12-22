import { useState, useCallback, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useSettings } from "@/hooks/use-settings";

export function useLinkedInIntegration() {
  const [clientId, setClientId] = useState("");
  const [clientSecret, setClientSecret] = useState("");
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { settings, refetchSettings } = useSettings();
  const redirectUri = `${window.location.origin}/auth/callback/linkedin`;

  const isConnected = settings?.linkedin_connected === true;

  // Load existing credentials on mount
  useEffect(() => {
    const loadCredentials = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: credentials, error } = await supabase
          .from('platform_auth_status')
          .select('auth_token, refresh_token')
          .eq('user_id', user.id)
          .eq('platform', 'linkedin')
          .single();

        if (error) {
          console.error('Error loading credentials:', error);
          return;
        }

        if (credentials) {
          setClientId(credentials.auth_token || '');
          setClientSecret(credentials.refresh_token || '');
        }
      } catch (error) {
        console.error('Error in loadCredentials:', error);
      }
    };

    loadCredentials();
  }, []);

  const handleUpdateCredentials = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (!clientId || !clientSecret) {
      setError("Bitte füllen Sie alle Felder aus");
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Kein Benutzer gefunden");

      // First check if an entry already exists
      const { data: existingAuth } = await supabase
        .from('platform_auth_status')
        .select('id')
        .eq('user_id', user.id)
        .eq('platform', 'linkedin')
        .single();

      let result;
      
      if (existingAuth) {
        // Update existing entry
        result = await supabase
          .from('platform_auth_status')
          .update({
            auth_token: clientId,
            refresh_token: clientSecret,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', user.id)
          .eq('platform', 'linkedin');
      } else {
        // Insert new entry
        result = await supabase
          .from('platform_auth_status')
          .insert({
            user_id: user.id,
            platform: 'linkedin',
            auth_token: clientId,
            refresh_token: clientSecret,
            is_connected: false,
            updated_at: new Date().toISOString()
          });
      }

      if (result.error) {
        if (result.error.code === '23505') { // Duplicate key error code
          throw new Error("LinkedIn Zugangsdaten existieren bereits. Die bestehenden Daten wurden aktualisiert.");
        }
        throw result.error;
      }

      toast({
        title: "Erfolg ✨",
        description: existingAuth 
          ? "LinkedIn Zugangsdaten erfolgreich aktualisiert"
          : "LinkedIn Zugangsdaten erfolgreich gespeichert",
      });

    } catch (error) {
      console.error("Error updating LinkedIn credentials:", error);
      setError(error.message);
      toast({
        title: "Fehler ❌",
        description: error.message || "Fehler beim Speichern der LinkedIn Zugangsdaten",
        variant: "destructive",
      });
    }
  };

  const connectLinkedIn = useCallback(async () => {
    setError(null);

    try {
      const { data: credentials } = await supabase
        .from('platform_auth_status')
        .select('auth_token')
        .eq('platform', 'linkedin')
        .single();

      if (!credentials?.auth_token) {
        throw new Error("Bitte speichern Sie zuerst Ihre LinkedIn Client ID");
      }

      const scope = "openid profile email w_member_social";
      const state = Math.random().toString(36).substring(7);
      localStorage.setItem("linkedin_oauth_state", state);
      
      const linkedInAuthUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${credentials.auth_token}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}&scope=${encodeURIComponent(scope)}`;
      
      console.log("Redirecting to:", linkedInAuthUrl);
      
      window.location.href = linkedInAuthUrl;
    } catch (error) {
      console.error("Error initiating LinkedIn connection:", error);
      setError(error.message);
      toast({
        title: "Fehler ❌",
        description: error.message,
        variant: "destructive",
      });
    }
  }, [redirectUri, toast]);

  const disconnectLinkedIn = async () => {
    setError(null);

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
      setError(error.message);
      toast({
        title: "Fehler ❌",
        description: "Fehler beim Trennen der LinkedIn Verbindung",
        variant: "destructive",
      });
    }
  };

  const copyRedirectUri = () => {
    navigator.clipboard.writeText(redirectUri);
    toast({
      title: "Erfolg ✨",
      description: "Redirect URI in die Zwischenablage kopiert",
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