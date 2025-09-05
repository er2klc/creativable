import { useLinkedInCredentials } from "./hooks/useLinkedInCredentials";
import { useLinkedInConnection } from "./hooks/useLinkedInConnection";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export function useLinkedInIntegration() {
  const {
    clientId,
    setClientId,
    clientSecret,
    setClientSecret,
    error,
    setError,
    isLoading,
    setIsLoading
  } = useLinkedInCredentials();

  const {
    isConnected,
    redirectUri,
    connectLinkedIn,
    disconnectLinkedIn
  } = useLinkedInConnection();

  const { toast } = useToast();

  const handleUpdateCredentials = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (!clientId || !clientSecret) {
        throw new Error("Bitte füllen Sie alle Felder aus");
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Kein Benutzer gefunden");

      const { data: existingAuth } = await supabase
        .from('platform_auth_status')
        .select('id')
        .eq('user_id', user.id)
        .eq('platform', 'linkedin')
        .single();

      let result;
      
      if (existingAuth) {
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
    } finally {
      setIsLoading(false);
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
    connectLinkedIn: () => connectLinkedIn(clientId),
    disconnectLinkedIn,
    copyRedirectUri,
  };
}