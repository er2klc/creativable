import React from "react";
import { Settings } from "@/integrations/supabase/types/settings";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useInstagramConnection } from "@/hooks/use-instagram-connection";

interface InstagramConnectionDialogProps {
  settings: Settings | undefined;
  redirectUri: string;
}

export function InstagramConnectionDialog({ settings, redirectUri }: InstagramConnectionDialogProps) {
  const { connectInstagram } = useInstagramConnection();

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Verbinden</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Instagram Integration Einrichten</DialogTitle>
          <DialogDescription>
            Verbinden Sie Ihr Instagram Business-Konto über Facebook:
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <h4 className="font-medium">Redirect URI</h4>
            <code className="block p-2 bg-muted rounded-md text-sm">
              {redirectUri}
            </code>
            <p className="text-sm text-muted-foreground">
              Diese URI muss in Ihrer Meta App hinterlegt sein
            </p>
          </div>
          <Button onClick={connectInstagram} className="w-full">
            Mit Facebook verbinden
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}