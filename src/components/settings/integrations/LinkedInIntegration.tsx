import React from "react";
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
import { LinkedInCredentialsForm } from "./linkedin/LinkedInCredentialsForm";
import { useLinkedInIntegration } from "./linkedin/useLinkedInIntegration";

export function LinkedInIntegration() {
  const {
    clientId,
    setClientId,
    clientSecret,
    setClientSecret,
    redirectUri,
    isConnected,
    handleUpdateCredentials,
    connectLinkedIn,
    copyRedirectUri,
  } = useLinkedInIntegration();

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
                Geben Sie Ihre LinkedIn API Zugangsdaten ein:
              </DialogDescription>
            </DialogHeader>
            <LinkedInCredentialsForm
              clientId={clientId}
              clientSecret={clientSecret}
              redirectUri={redirectUri}
              onClientIdChange={setClientId}
              onClientSecretChange={setClientSecret}
              onSubmit={handleUpdateCredentials}
              onConnect={connectLinkedIn}
              onCopyRedirectUri={copyRedirectUri}
            />
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