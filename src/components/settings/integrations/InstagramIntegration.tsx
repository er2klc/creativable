import React from "react";
import { Instagram } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSettings } from "@/hooks/use-settings";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export function InstagramIntegration() {
  const { settings, updateSettings } = useSettings();
  const { toast } = useToast();

  const connectInstagram = async () => {
    try {
      // Get the Instagram App ID from Edge Function
      const { data: { INSTAGRAM_APP_ID }, error } = await supabase.functions.invoke('get-secret', {
        body: JSON.stringify({ secretName: 'INSTAGRAM_APP_ID' }),
      });

      if (error || !INSTAGRAM_APP_ID) {
        throw new Error('Could not get Instagram configuration');
      }

      // Generate random state for CSRF protection
      const state = Math.random().toString(36).substring(7);
      localStorage.setItem('instagram_oauth_state', state);

      // Construct Instagram OAuth URL
      const redirectUri = `${window.location.origin}/auth/callback/instagram`;
      const scope = 'basic,instagram_basic,instagram_content_publish,instagram_manage_comments,instagram_manage_insights';
      
      const instagramUrl = `https://api.instagram.com/oauth/authorize?client_id=${INSTAGRAM_APP_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scope)}&response_type=code&state=${state}`;

      // Redirect to Instagram
      window.location.href = instagramUrl;
    } catch (error) {
      console.error('Error connecting to Instagram:', error);
      toast({
        title: "Fehler",
        description: "Verbindung zu Instagram konnte nicht hergestellt werden.",
        variant: "destructive",
      });
    }
  };

  const disconnectInstagram = async () => {
    try {
      await updateSettings('instagram_connected', false);
      await updateSettings('instagram_auth_token', null);
      
      toast({
        title: "Erfolg",
        description: "Instagram wurde erfolgreich getrennt.",
      });
    } catch (error) {
      console.error('Error disconnecting Instagram:', error);
      toast({
        title: "Fehler",
        description: "Instagram konnte nicht getrennt werden.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex items-center justify-between p-4 border rounded-lg">
      <div className="flex items-center gap-2">
        <Instagram className="h-5 w-5" />
        <div>
          <h3 className="font-medium">Instagram</h3>
          <p className="text-sm text-muted-foreground">
            {settings?.instagram_connected 
              ? "Verbunden mit Instagram" 
              : "Nicht verbunden mit Instagram"}
          </p>
        </div>
      </div>
      <Button
        variant={settings?.instagram_connected ? "destructive" : "default"}
        onClick={settings?.instagram_connected ? disconnectInstagram : connectInstagram}
      >
        {settings?.instagram_connected ? "Trennen" : "Verbinden"}
      </Button>
    </div>
  );
}