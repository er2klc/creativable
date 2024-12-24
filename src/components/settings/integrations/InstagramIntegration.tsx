import React from "react";
import { useSettings } from "@/hooks/use-settings";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle, XCircle, Instagram } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { InstagramConnectionDialog } from "./instagram/InstagramConnectionDialog";
import { InstagramDisconnectDialog } from "./instagram/InstagramDisconnectDialog";
import { supabase } from "@/integrations/supabase/client";

export function InstagramIntegration() {
  const { settings, updateSettings, refetchSettings } = useSettings();
  const { toast } = useToast();
  const redirectUri = `${window.location.origin}/auth/callback/instagram`;
  const isConnected = settings?.instagram_connected === true;

  const checkConnectionStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { data: platformAuth } = await supabase
        .from('platform_auth_status')
        .select('is_connected, access_token')
        .eq('platform', 'instagram')
        .eq('user_id', user.id)
        .single();

      console.log('Platform auth status:', platformAuth);
      
      if (platformAuth?.is_connected && platformAuth?.access_token) {
        await updateSettings('instagram_connected', true);
        return true;
      } else {
        await updateSettings('instagram_connected', false);
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

      const scope = [
        'email',
        'public_profile',
        'instagram_basic',
        'instagram_content_publish'
      ].join(',');

      const state = crypto.randomUUID();
      localStorage.setItem('instagram_oauth_state', state);

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

  const handleUpdateCredentials = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log('Updating Instagram credentials...');
    
    const formData = new FormData(e.currentTarget);
    const appId = formData.get('instagram_app_id') as string;
    const appSecret = formData.get('instagram_app_secret') as string;

    if (!appId || !appSecret) {
      toast({
        title: "Fehlende Eingaben",
        description: "Bitte füllen Sie alle Felder aus",
        variant: "destructive",
      });
      return;
    }

    await updateSettings('instagram_app_id', appId);
    await updateSettings('instagram_app_secret', appSecret);

    toast({
      title: "Erfolg",
      description: "Instagram Zugangsdaten wurden gespeichert",
    });
  };

  React.useEffect(() => {
    checkConnectionStatus();
  }, []);

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Instagram className="h-6 w-6 text-[#E4405F]" />
          <h3 className="text-lg font-medium">Instagram Integration (via Facebook)</h3>
          {isConnected ? (
            <CheckCircle className="h-5 w-5 text-green-500" />
          ) : (
            <XCircle className="h-5 w-5 text-red-500" />
          )}
        </div>
        {isConnected ? (
          <div className="flex gap-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline">Einstellungen</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Instagram Integration Einrichten</DialogTitle>
                  <DialogDescription>
                    Geben Sie Ihre Instagram API Zugangsdaten ein:
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleUpdateCredentials} className="space-y-4">
                  <div className="space-y-2">
                    <h4 className="font-medium">Redirect URI</h4>
                    <code className="block p-2 bg-muted rounded-md text-sm">
                      {redirectUri}
                    </code>
                    <p className="text-sm text-muted-foreground">
                      Diese URI ist in Ihrer Meta App hinterlegt
                    </p>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
            <InstagramDisconnectDialog onDisconnect={disconnectInstagram} />
          </div>
        ) : (
          <InstagramConnectionDialog
            settings={settings}
            redirectUri={redirectUri}
            onUpdateCredentials={handleUpdateCredentials}
            onConnect={connectInstagram}
          />
        )}
      </div>
      <p className="text-sm text-muted-foreground">
        Verbinden Sie Ihr Instagram-Konto über Facebook um Leads automatisch zu kontaktieren und
        Nachrichten zu versenden.
      </p>
    </Card>
  );
}