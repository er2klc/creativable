import React from "react";
import { useSettings } from "@/hooks/use-settings";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle, XCircle, Video } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function TikTokIntegration() {
  const { settings, updateSettings } = useSettings();
  const { toast } = useToast();
  const redirectUri = `${window.location.origin}/auth/callback/tiktok`;
  const isConnected = settings?.tiktok_connected || false;

  const connectTikTok = async () => {
    try {
      // TikTok OAuth flow will be implemented here
      toast({
        title: "TikTok Integration",
        description: "TikTok Integration wird bald verfügbar sein.",
      });
    } catch (error) {
      console.error("Error connecting to TikTok:", error);
      toast({
        title: "Fehler bei der TikTok-Verbindung",
        description: "Bitte versuchen Sie es später erneut",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Video className="h-6 w-6" />
          <h3 className="text-lg font-medium">TikTok Integration</h3>
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
              <DialogTitle>TikTok Integration Einrichten</DialogTitle>
              <DialogDescription>
                Folgen Sie diesen Schritten um TikTok zu verbinden:
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-medium">1. TikTok Developer Account</h4>
                <p className="text-sm text-muted-foreground">
                  Erstellen Sie einen TikTok Developer Account und eine neue App.
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium">2. OAuth 2.0 Einstellungen</h4>
                <p className="text-sm text-muted-foreground">
                  Fügen Sie diese Redirect URI zu Ihrer TikTok App hinzu:
                </p>
                <code className="block p-2 bg-muted rounded-md text-sm">
                  {redirectUri}
                </code>
              </div>
              <Button onClick={connectTikTok} className="w-full">
                Mit TikTok verbinden
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <p className="text-sm text-muted-foreground">
        Verbinden Sie Ihr TikTok-Konto um Leads automatisch zu kontaktieren und
        Nachrichten zu versenden.
      </p>
    </Card>
  );
}