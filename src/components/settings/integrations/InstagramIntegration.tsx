import React, { useEffect, useState } from "react";
import { useSettings } from "@/hooks/use-settings";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle, XCircle, Instagram, AlertCircle, Info } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useInstagramConnection } from "@/hooks/use-instagram-connection";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ConnectionStatus {
  isConnected: boolean;
  expiresAt: string | null;
}

export function InstagramIntegration() {
  const { settings } = useSettings();
  const { checkConnectionStatus, connectInstagram, disconnectInstagram } = useInstagramConnection();
  const [connectionDetails, setConnectionDetails] = useState<ConnectionStatus>({ 
    isConnected: false, 
    expiresAt: null 
  });
  const redirectUri = `${window.location.origin}/auth/callback/instagram`;

  useEffect(() => {
    const fetchStatus = async () => {
      const status = await checkConnectionStatus();
      setConnectionDetails(status);
    };
    fetchStatus();
  }, [settings?.instagram_connected]);

  // Convert string to boolean for comparison
  const isInstagramConnected = settings?.instagram_connected === true || settings?.instagram_connected === 'true';

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Instagram className="h-6 w-6 text-[#E4405F]" />
          <h3 className="text-lg font-medium">Instagram Integration</h3>
          {connectionDetails.isConnected ? (
            <CheckCircle className="h-5 w-5 text-green-500" />
          ) : (
            <XCircle className="h-5 w-5 text-red-500" />
          )}
        </div>
        <div className="flex gap-2">
          {isInstagramConnected ? (
            <>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline">Einstellungen</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Instagram Integration Details</DialogTitle>
                    <DialogDescription>
                      Ihre Instagram-Verbindung ist aktiv
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <h4 className="font-medium">Token gültig bis</h4>
                      <p className="text-sm">
                        {connectionDetails.expiresAt ? (
                          format(new Date(connectionDetails.expiresAt), "PPP", { locale: de })
                        ) : (
                          "Kein Ablaufdatum verfügbar"
                        )}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-medium">Redirect URI</h4>
                      <code className="block p-2 bg-muted rounded-md text-sm">
                        {redirectUri}
                      </code>
                    </div>
                    <Button 
                      onClick={connectInstagram} 
                      className="w-full"
                    >
                      Verbindung erneuern
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
              <Button variant="destructive" onClick={disconnectInstagram}>
                Trennen
              </Button>
            </>
          ) : (
            <Button onClick={connectInstagram}>Verbinden</Button>
          )}
        </div>
      </div>
      <p className="text-sm text-muted-foreground mb-4">
        Verbinden Sie Ihr Instagram-Konto um Leads automatisch zu kontaktieren und
        Nachrichten zu versenden.
      </p>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Diese Integration erfordert einen Instagram Business oder Creator Account. 
          Normale Instagram-Konten können nicht für das Senden von Nachrichten verwendet werden.
        </AlertDescription>
      </Alert>

      {connectionDetails.expiresAt && new Date(connectionDetails.expiresAt) < new Date() && (
        <div className="mt-4 flex items-center gap-2 text-yellow-600 bg-yellow-50 p-3 rounded-md">
          <AlertCircle className="h-5 w-5" />
          <p className="text-sm">
            Ihr Instagram-Token ist abgelaufen. Bitte erneuern Sie die Verbindung.
          </p>
        </div>
      )}
    </Card>
  );
}