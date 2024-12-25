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
      // Generate random state for CSRF protection
      const state = Math.random().toString(36).substring(7);
      localStorage.setItem('instagram_oauth_state', state);

      // Use the direct Instagram OAuth URL with the state parameter
      const instagramUrl = `https://www.instagram.com/oauth/authorize?enable_fb_login=0&force_authentication=1&client_id=1315021952869619&redirect_uri=https://social-lead-symphony.lovable.app/auth/callback/instagram&response_type=code&scope=instagram_business_basic,instagram_business_manage_messages,instagram_business_manage_comments,instagram_business_content_publish&state=${state}`;

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
      await updateSettings('instagram_connected', 'false');
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
            {settings?.instagram_connected === 'true'
              ? "Verbunden mit Instagram" 
              : "Nicht verbunden mit Instagram"}
          </p>
        </div>
      </div>
      <Button
        variant={settings?.instagram_connected === 'true' ? "destructive" : "default"}
        onClick={settings?.instagram_connected === 'true' ? disconnectInstagram : connectInstagram}
      >
        {settings?.instagram_connected === 'true' ? "Trennen" : "Verbinden"}
      </Button>
    </div>
  );
}