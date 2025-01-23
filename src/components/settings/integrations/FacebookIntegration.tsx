import React from "react";
import { useSettings } from "@/hooks/use-settings";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle, XCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";

interface FacebookSDK {
  init(options: {
    appId: string;
    cookie?: boolean;
    xfbml?: boolean;
    version: string;
  }): void;
  login(
    callback: (response: { authResponse?: { accessToken: string } }) => void,
    options?: { scope: string }
  ): void;
}

declare global {
  interface Window {
    FB?: FacebookSDK;
    fbAsyncInit?: () => void;
  }
}

export function FacebookIntegration() {
  const { settings, updateSettings } = useSettings();
  const { toast } = useToast();
  const redirectUri = `${window.location.origin}/auth/callback/facebook`;
  const isConnected = settings?.facebook_connected || false;

  const initializeFacebookSDK = async () => {
    try {
      const { data: { FACEBOOK_APP_ID }, error: appIdError } = await supabase.functions.invoke('get-secret', {
        body: { name: 'FACEBOOK_APP_ID' }
      });

      // Wenn kein App ID vorhanden ist, zeigen wir keinen Fehler
      if (!FACEBOOK_APP_ID) {
        console.log("Facebook App ID nicht konfiguriert");
        return;
      }

      if (appIdError) throw appIdError;

      // Initialize Facebook SDK
      window.fbAsyncInit = function() {
        if (window.FB) {
          window.FB.init({
            appId: FACEBOOK_APP_ID,
            cookie: true,
            xfbml: true,
            version: 'v18.0'
          });
        }
      };

      // Load Facebook SDK
      (function(d, s, id) {
        var js, fjs = d.getElementsByTagName(s)[0];
        if (d.getElementById(id)) return;
        js = d.createElement(s); js.id = id;
        js.src = "https://connect.facebook.net/en_US/sdk.js";
        fjs.parentNode?.insertBefore(js, fjs);
      }(document, 'script', 'facebook-jssdk'));

    } catch (error) {
      console.error("Error initializing Facebook SDK:", error);
    }
  };

  React.useEffect(() => {
    initializeFacebookSDK();
  }, []);

  const connectFacebook = async () => {
    try {
      if (typeof window.FB !== 'undefined') {
        window.FB.login(function(response) {
          if (response.authResponse) {
            const accessToken = response.authResponse.accessToken;
            updateSettings.mutate({
              facebook_auth_token: accessToken,
              facebook_connected: true
            });
            toast({
              title: "Facebook erfolgreich verbunden",
              description: "Ihre Facebook-Integration wurde erfolgreich eingerichtet.",
            });
          }
        }, {scope: 'email,public_profile,pages_show_list,pages_messaging,pages_manage_metadata'});
      } else {
        toast({
          title: "Facebook SDK nicht verfügbar",
          description: "Die Integration ist derzeit nicht verfügbar.",
        });
      }
    } catch (error) {
      console.error("Error connecting to Facebook:", error);
      toast({
        title: "Fehler bei der Facebook-Verbindung",
        description: "Bitte versuchen Sie es später erneut",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-6 w-6 text-[#1877F2]" />
          <h3 className="text-lg font-medium">Facebook Integration</h3>
          {isConnected ? (
            <CheckCircle className="h-5 w-5 text-green-500" />
          ) : (
            <XCircle className="h-5 w-5 text-red-500" />
          )}
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant={isConnected ? "outline" : "default"}>
              {isConnected ? "Einstellungen" : "Verbinden"}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Facebook Integration Einrichten</DialogTitle>
              <DialogDescription>
                Folgen Sie diesen Schritten um Facebook zu verbinden:
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-medium">1. Meta Developer Account</h4>
                <p className="text-sm text-muted-foreground">
                  Erstellen Sie einen Meta Developer Account und eine neue App.
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium">2. Domain Einstellungen</h4>
                <p className="text-sm text-muted-foreground">
                  Fügen Sie diese Domain zu Ihrer Meta App hinzu:
                </p>
                <code className="block p-2 bg-muted rounded-md text-sm">
                  creativable.de
                </code>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium">3. OAuth 2.0 Einstellungen</h4>
                <p className="text-sm text-muted-foreground">
                  Fügen Sie diese Redirect URI zu Ihrer Meta App hinzu:
                </p>
                <code className="block p-2 bg-muted rounded-md text-sm">
                  {redirectUri}
                </code>
              </div>
              <Button onClick={connectFacebook} className="w-full">
                Mit Facebook verbinden
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <p className="text-sm text-muted-foreground">
        Verbinden Sie Ihr Facebook-Konto um Leads automatisch zu kontaktieren und
        Nachrichten zu versenden.
      </p>
    </Card>
  );
}