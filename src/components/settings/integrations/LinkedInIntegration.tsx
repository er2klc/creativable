import React from "react";
import { useSettings } from "@/hooks/use-settings";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle, XCircle, Linkedin } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";

export function LinkedInIntegration() {
  const { settings, updateSettings } = useSettings();
  const { toast } = useToast();
  const redirectUri = `${window.location.origin}/auth/callback/linkedin`;
  const isConnected = settings?.linkedin_connected || false;

  const connectLinkedIn = async () => {
    try {
      // LinkedIn OAuth configuration
      const clientId = "YOUR_LINKEDIN_CLIENT_ID"; // This should come from Supabase secrets
      const scope = "r_liteprofile r_emailaddress w_member_social";
      const state = Math.random().toString(36).substring(7);
      
      // Store state in localStorage for validation when LinkedIn redirects back
      localStorage.setItem("linkedin_oauth_state", state);
      
      // Construct LinkedIn OAuth URL
      const linkedInAuthUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}&scope=${encodeURIComponent(scope)}`;
      
      // Redirect to LinkedIn login
      window.location.href = linkedInAuthUrl;
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
        <div className="flex items-center gap-3">
          <Linkedin className="h-6 w-6 text-[#0A66C2]" />
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
          <DialogContent className="sm:max-w-[425px]">
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
                  Erstellen Sie einen LinkedIn Developer Account und eine neue App unter{" "}
                  <a
                    href="https://www.linkedin.com/developers/apps"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    LinkedIn Developers
                  </a>
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
              <div className="space-y-2">
                <h4 className="font-medium">3. Berechtigungen</h4>
                <p className="text-sm text-muted-foreground">
                  Aktivieren Sie folgende OAuth 2.0 Berechtigungen:
                </p>
                <ul className="list-disc list-inside text-sm text-muted-foreground">
                  <li>r_liteprofile</li>
                  <li>r_emailaddress</li>
                  <li>w_member_social</li>
                </ul>
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