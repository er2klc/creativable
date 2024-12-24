import { useSettings } from "@/hooks/use-settings";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export function useInstagramConnection() {
  const { settings, updateSettings, refetchSettings } = useSettings();
  const { toast } = useToast();

  const checkConnectionStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { data: platformAuth } = await supabase
        .from('platform_auth_status')
        .select('is_connected, access_token')
        .eq('platform', 'instagram')
        .eq('user_id', user.id)
        .maybeSingle();

      console.log('Platform auth status:', platformAuth);
      
      if (platformAuth?.is_connected && platformAuth?.access_token) {
        await updateSettings('instagram_connected', 'true');
        return true;
      } else {
        await updateSettings('instagram_connected', 'false');
        return false;
      }
    } catch (error) {
      console.error('Error checking connection status:', error);
      return false;
    }
  };

  const connectInstagram = async () => {
    try {
      console.log('Starting Instagram connection process...');
      
      if (!settings?.instagram_app_id || !settings?.instagram_app_secret) {
        toast({
          title: "Fehlende Zugangsdaten",
          description: "Bitte geben Sie die Instagram App ID und das App Secret ein",
          variant: "destructive",
        });
        return;
      }

      // Updated scopes according to Facebook documentation
      const scope = [
        'email',
        'public_profile',
        'pages_show_list',
        'pages_read_engagement',
        'pages_manage_posts',
        'business_management'
      ].join(',');

      const state = crypto.randomUUID();
      localStorage.setItem('instagram_oauth_state', state);

      const redirectUri = `${window.location.origin}/auth/callback/instagram`;
      const params = new URLSearchParams({
        client_id: settings.instagram_app_id,
        redirect_uri: redirectUri,
        scope: scope,
        response_type: 'code',
        state: state
      });

      console.log('Redirecting to Instagram auth URL...');
      window.location.href = `https://www.facebook.com/v18.0/dialog/oauth?${params.toString()}`;
    } catch (error) {
      console.error('Error connecting to Instagram:', error);
      toast({
        title: "Fehler bei der Instagram-Verbindung",
        description: "Bitte versuchen Sie es später erneut",
        variant: "destructive",
      });
    }
  };

  const disconnectInstagram = async () => {
    try {
      console.log('Disconnecting from Instagram...');
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Kein Benutzer gefunden');

      // Update platform_auth_status
      const { error: statusError } = await supabase
        .from('platform_auth_status')
        .update({
          is_connected: false,
          access_token: null,
          updated_at: new Date().toISOString()
        })
        .eq('platform', 'instagram')
        .eq('user_id', user.id);

      if (statusError) throw statusError;

      // Update settings
      await updateSettings('instagram_connected', 'false');
      await refetchSettings();
      
      toast({
        title: "Instagram getrennt",
        description: "Ihre Instagram-Verbindung wurde erfolgreich getrennt",
      });
    } catch (error) {
      console.error('Error disconnecting from Instagram:', error);
      toast({
        title: "Fehler beim Trennen",
        description: "Bitte versuchen Sie es später erneut",
        variant: "destructive",
      });
    }
  };

  return {
    checkConnectionStatus,
    connectInstagram,
    disconnectInstagram,
    isConnected: settings?.instagram_connected === 'true'
  };
}