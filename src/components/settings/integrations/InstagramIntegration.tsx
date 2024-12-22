import React from "react";
import { useSettings } from "@/hooks/use-settings";
import { useToast } from "@/hooks/use-toast";
import { InstagramSetupInstructions } from "./instagram/InstagramSetupInstructions";
import { InstagramConnectionForm } from "./instagram/InstagramConnectionForm";

export function InstagramIntegration() {
  const { settings, updateSettings } = useSettings();
  const { toast } = useToast();
  const redirectUri = `${window.location.origin}/auth/callback/instagram`;

  // Update form values when settings are loaded
  const defaultValues = {
    instagram_app_id: settings?.instagram_app_id || "",
    instagram_app_secret: settings?.instagram_app_secret || "",
  };

  const connectInstagram = async (appId: string, appSecret: string) => {
    try {
      await updateSettings("instagram_app_id", appId);
      await updateSettings("instagram_app_secret", appSecret);

      const scope = [
        'instagram_basic',
        'instagram_content_publish',
        'instagram_manage_comments',
        'instagram_manage_insights',
        'pages_show_list',
        'pages_read_engagement',
        'business_management'
      ].join(',');

      const state = crypto.randomUUID();
      localStorage.setItem('instagram_oauth_state', state);

      const params = new URLSearchParams({
        client_id: appId,
        redirect_uri: redirectUri,
        scope: scope,
        response_type: 'code',
        state: state
      });

      window.location.href = `https://www.facebook.com/v18.0/dialog/oauth?${params.toString()}`;
    } catch (error) {
      console.error('Error connecting to Instagram:', error);
      toast({
        title: "Fehler bei der Instagram-Verbindung",
        description: "Bitte überprüfen Sie Ihre App-ID und App-Secret",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Instagram Integration 📸</h3>
      <InstagramSetupInstructions redirectUri={redirectUri} />
      <InstagramConnectionForm 
        defaultValues={defaultValues}
        onConnect={connectInstagram}
      />
    </div>
  );
}