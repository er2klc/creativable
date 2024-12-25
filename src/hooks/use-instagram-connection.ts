import { useSettings } from "@/hooks/use-settings";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export function useInstagramConnection() {
  const { settings, updateSettings, refetchSettings } = useSettings();
  const { toast } = useToast();

  const checkConnectionStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { isConnected: false, expiresAt: null };

      const { data: platformAuth } = await supabase
        .from('platform_auth_status')
        .select('access_token, expires_at')
        .eq('platform', 'instagram')
        .eq('user_id', user.id)
        .maybeSingle();

      return {
        isConnected: !!platformAuth?.access_token,
        expiresAt: platformAuth?.expires_at || null
      };
    } catch (error) {
      console.error('Error checking Instagram connection status:', error);
      return {
        isConnected: false,
        expiresAt: null
      };
    }
  };

  const connectInstagram = async () => {
    try {
      console.log('Starting Instagram connection process...');

      const scope = [
        'instagram_basic',
        'instagram_manage_messages',
        'instagram_manage_comments',
        'instagram_content_publish',
        'pages_manage_metadata',
        'pages_read_engagement',
        'pages_show_list',
        'pages_messaging'
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

      const authUrl = `https://www.facebook.com/v18.0/dialog/oauth?${params.toString()}`;
      console.log('Redirecting to Facebook auth URL:', authUrl);
      
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

      const { error: statusError } = await supabase
        .from('platform_auth_status')
        .update({
          access_token: null,
          expires_at: null,
          updated_at: new Date().toISOString()
        })
        .eq('platform', 'instagram')
        .eq('user_id', user.id);

      if (statusError) throw statusError;

      await updateSettings('instagram_connected', null);
      await refetchSettings();
      
      toast({
        title: "Instagram getrennt",
        description: "Ihre Instagram-Verbindung wurde erfolgreich getrennt",
      });

      // Force a page reload to ensure all states are reset
      window.location.reload();
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
    isConnected: !!settings?.instagram_connected
  };
}