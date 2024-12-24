import React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Settings } from "@/integrations/supabase/types/settings";

interface InstagramConnectionDialogProps {
  settings: Settings;
  redirectUri: string;
  onUpdateCredentials: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
  onConnect: () => Promise<void>;
}

export function InstagramConnectionDialog({
  settings,
  redirectUri,
  onUpdateCredentials,
  onConnect,
}: InstagramConnectionDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Verbinden</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Instagram Integration Einrichten</DialogTitle>
          <DialogDescription>
            Geben Sie Ihre Instagram API Zugangsdaten ein:
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onUpdateCredentials} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="instagram_app_id">Instagram App ID</Label>
            <Input
              id="instagram_app_id"
              name="instagram_app_id"
              defaultValue={settings?.instagram_app_id || ''}
              placeholder="123456789..."
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="instagram_app_secret">Instagram App Secret</Label>
            <Input
              id="instagram_app_secret"
              name="instagram_app_secret"
              type="password"
              defaultValue={settings?.instagram_app_secret || ''}
              placeholder="abc123..."
            />
          </div>
          <div className="space-y-2">
            <h4 className="font-medium">Redirect URI</h4>
            <code className="block p-2 bg-muted rounded-md text-sm">
              {redirectUri}
            </code>
            <p className="text-sm text-muted-foreground">
              Fügen Sie diese URI zu Ihrer Meta App hinzu
            </p>
          </div>
          <div className="flex gap-2">
            <Button type="submit" className="flex-1">
              Zugangsdaten Speichern
            </Button>
            <Button type="button" onClick={onConnect} className="flex-1">
              Mit Instagram verbinden
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}