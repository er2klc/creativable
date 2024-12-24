import React from "react";
import { useSettings } from "@/hooks/use-settings";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle, XCircle, Instagram } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { InstagramConnectionDialog } from "./instagram/InstagramConnectionDialog";
import { InstagramDisconnectDialog } from "./instagram/InstagramDisconnectDialog";
import { useInstagramConnection } from "@/hooks/use-instagram-connection";

export function InstagramIntegration() {
  const { settings } = useSettings();
  const { isConnected, checkConnectionStatus } = useInstagramConnection();
  const redirectUri = `${window.location.origin}/auth/callback/instagram`;

  React.useEffect(() => {
    checkConnectionStatus();
  }, []);

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Instagram className="h-6 w-6 text-[#E4405F]" />
          <h3 className="text-lg font-medium">Instagram & Facebook Integration</h3>
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
                <div className="space-y-2">
                  <h4 className="font-medium">Redirect URI</h4>
                  <code className="block p-2 bg-muted rounded-md text-sm">
                    {redirectUri}
                  </code>
                  <p className="text-sm text-muted-foreground">
                    Diese URI ist in Ihrer Meta App hinterlegt
                  </p>
                </div>
              </DialogContent>
            </Dialog>
            <InstagramDisconnectDialog />
          </div>
        ) : (
          <InstagramConnectionDialog
            settings={settings}
            redirectUri={redirectUri}
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