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

      // Aktualisierte LinkedIn OAuth Scopes
      const scopes = [
        'profile',           // Ersetzt r_liteprofile
        'email',            // Ersetzt r_emailaddress
        'w_member_social'   // Für Messaging-Funktionalität
      ].join(' ');

      const state = Math.random().toString(36).substring(7);
      localStorage.setItem("linkedin_oauth_state", state);
      
      const linkedInAuthUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}&scope=${encodeURIComponent(scopes)}`;
      
      console.log("LinkedIn Auth URL:", linkedInAuthUrl);
      console.log("Redirect URI:", redirectUri);
      console.log("Scopes:", scopes);
      
      window.location.href = linkedInAuthUrl;
    } catch (error) {
      console.error("Error initiating LinkedIn connection:", error);
      toast({
        title: "Fehler ❌",
        description: error instanceof Error ? error.message : "Fehler beim Verbinden mit LinkedIn",
        variant: "destructive",
      });
    }
  }, [redirectUri, toast]);

  const disconnectLinkedIn = async () => {
    try {
      console.log("Starting LinkedIn disconnect process...");
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Kein Benutzer gefunden");

      // Get current platform auth status
      const { data: platformAuth } = await supabase
        .from('platform_auth_status')
        .select('access_token, auth_token, refresh_token')
        .eq('user_id', user.id)
        .eq('platform', 'linkedin')
        .single();

      console.log("Current platform auth status:", platformAuth);

      // Try to revoke token if we have one
      if (platformAuth?.access_token) {
        try {
          console.log("Attempting to revoke LinkedIn token...");
          await supabase.functions.invoke('linkedin-auth-callback', {
            body: {
              action: 'revoke',
              accessToken: platformAuth.access_token,
              clientId: platformAuth.auth_token,
              clientSecret: platformAuth.refresh_token,
            },
          });
          console.log("Successfully revoked LinkedIn token");
        } catch (revokeError) {
          console.error('Error revoking LinkedIn token:', revokeError);
          // Continue with disconnection even if revocation fails
        }
      }

      // Update platform_auth_status
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

      if (disconnectError) {
        console.error("Error updating platform auth status:", disconnectError);
        throw disconnectError;
      }

      // Update settings
      const { error: settingsError } = await supabase
        .from('settings')
        .update({ linkedin_connected: false })
        .eq('user_id', user.id);

      if (settingsError) {
        console.error("Error updating settings:", settingsError);
        throw settingsError;
      }

      // Clear any stored tokens in localStorage
      localStorage.removeItem("linkedin_oauth_state");
      console.log("Cleared localStorage tokens");

      await refetchSettings();
      console.log("Successfully refreshed settings");

      toast({
        title: "Erfolg ✨",
        description: "LinkedIn Verbindung erfolgreich getrennt",
      });

    } catch (error: any) {
      console.error("Error disconnecting LinkedIn:", error);
      
      // Handle specific token refresh errors
      if (error.message?.includes('refresh_token_not_found')) {
        console.log("Refresh token not found, attempting forced disconnect...");
        // If refresh token is not found, force disconnect
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            // Force update platform_auth_status
            await supabase
              .from('platform_auth_status')
              .update({
                is_connected: false,
                access_token: null,
                refresh_token: null, // Also clear refresh token
                expires_at: null,
                updated_at: new Date().toISOString()
              })
              .eq('user_id', user.id)
              .eq('platform', 'linkedin');

            // Force update settings
            await supabase
              .from('settings')
              .update({ 
                linkedin_connected: false,
                linkedin_auth_token: null // Also clear auth token in settings
              })
              .eq('user_id', user.id);

            await refetchSettings();
            console.log("Forced disconnect completed successfully");
            
            // Show success message for forced disconnect
            toast({
              title: "Erfolg ✨",
              description: "LinkedIn Verbindung wurde zurückgesetzt",
            });
            return; // Exit early after successful forced disconnect
          }
        } catch (cleanupError) {
          console.error("Error during forced disconnect:", cleanupError);
        }
      }

      toast({
        title: "Fehler ❌",
        description: "Fehler beim Trennen der LinkedIn Verbindung. Bitte versuchen Sie es erneut.",
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