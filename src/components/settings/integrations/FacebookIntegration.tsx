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

export function FacebookIntegration() {
  const { settings, updateSettings } = useSettings();
  const { toast } = useToast();
  const redirectUri = `${window.location.origin}/auth/callback/facebook`;
  const isConnected = settings?.facebook_connected || false;

  const connectFacebook = async () => {
    try {
      // Initialize Facebook login
      if (typeof FB !== 'undefined') {
        FB.login(function(response) {
          if (response.authResponse) {
            // User successfully authenticated with Facebook
            const accessToken = response.authResponse.accessToken;
            updateSettings({
              facebook_auth_token: accessToken,
              facebook_connected: true
            });
            toast({
              title: "Facebook erfolgreich verbunden",
              description: "Ihre Facebook-Integration wurde erfolgreich eingerichtet.",
            });
          } else {
            toast({
              title: "Facebook-Verbindung fehlgeschlagen",
              description: "Bitte versuchen Sie es später erneut",
              variant: "destructive",
            });
          }
        }, {scope: 'email,public_profile,pages_show_list,pages_messaging,pages_manage_metadata'});
      } else {
        toast({
          title: "Facebook SDK nicht geladen",
          description: "Bitte laden Sie die Seite neu und versuchen Sie es erneut.",
          variant: "destructive",
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
                <h4 className="font-medium">2. OAuth 2.0 Einstellungen</h4>
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