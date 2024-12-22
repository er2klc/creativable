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

export function LinkedInIntegration() {
  const { settings, updateSettings } = useSettings();
  const { toast } = useToast();
  const redirectUri = `${window.location.origin}/auth/callback/linkedin`;
  const isConnected = settings?.linkedin_connected || false;

  const connectLinkedIn = async () => {
    try {
      // LinkedIn OAuth flow will be implemented here
      toast({
        title: "LinkedIn Integration",
        description: "LinkedIn Integration wird bald verfügbar sein.",
      });
    } catch (error) {
      console.error("Error connecting to LinkedIn:", error);
      toast({
        title: "Fehler bei der LinkedIn-Verbindung",
        description: "Bitte versuchen Sie es später erneut",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-medium">LinkedIn Integration</h3>
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
              <DialogTitle>LinkedIn Integration Einrichten</DialogTitle>
              <DialogDescription>
                Folgen Sie diesen Schritten um LinkedIn zu verbinden:
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-medium">1. LinkedIn Developer Account</h4>
                <p className="text-sm text-muted-foreground">
                  Erstellen Sie einen LinkedIn Developer Account und eine neue App.
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium">2. OAuth 2.0 Einstellungen</h4>
                <p className="text-sm text-muted-foreground">
                  Fügen Sie diese Redirect URI zu Ihrer LinkedIn App hinzu:
                </p>
                <code className="block p-2 bg-muted rounded-md text-sm">
                  {redirectUri}
                </code>
              </div>
              <Button onClick={connectLinkedIn} className="w-full">
                Mit LinkedIn verbinden
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <p className="text-sm text-muted-foreground">
        Verbinden Sie Ihr LinkedIn-Konto um Leads automatisch zu kontaktieren und
        Nachrichten zu versenden.
      </p>
    </Card>
  );
}