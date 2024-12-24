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

      // Check platform_auth_status table
      const { data: platformAuth } = await supabase
        .from('platform_auth_status')
        .select('is_connected, access_token')
        .eq('platform', 'instagram')
        .eq('user_id', user.id)
        .maybeSingle();

      const isConnected = platformAuth?.is_connected === true && !!platformAuth?.access_token;
      
      // Update settings to match platform_auth_status
      if (settings?.instagram_connected !== isConnected) {
        await updateSettings('instagram_connected', isConnected);
      }
      
      return isConnected;
    } catch (error) {
      console.error('Error checking connection status:', error);
      return false;
    }
  };

  const connectInstagram = async () => {
    try {
      console.log('Starting Instagram connection process...');

      const scope = [
        'instagram_business_basic',
        'instagram_business_manage_messages',
        'instagram_business_manage_comments',
        'instagram_business_content_publish'
      ].join(',');

      const state = crypto.randomUUID();
      localStorage.setItem('instagram_oauth_state', state);

      const redirectUri = `${window.location.origin}/auth/callback/instagram`;
      console.log('Using redirect URI:', redirectUri);

      const params = new URLSearchParams({
        client_id: '1315021952869619',
        redirect_uri: redirectUri,
        response_type: 'code',
        scope: scope,
        state: state,
        enable_fb_login: '0',
        force_authentication: '1'
      });

      const authUrl = `https://www.instagram.com/oauth/authorize?${params.toString()}`;
      console.log('Redirecting to Instagram auth URL:', authUrl);
      
      window.location.href = authUrl;
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
      await updateSettings('instagram_connected', false);
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
    isConnected: settings?.instagram_connected === true
  };
}