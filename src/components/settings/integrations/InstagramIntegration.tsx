import React from "react";
import { useSettings } from "@/hooks/use-settings";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle, XCircle, Instagram } from "lucide-react";
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
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

export function InstagramIntegration() {
  const { settings, updateSettings } = useSettings();
  const { toast } = useToast();
  const redirectUri = `${window.location.origin}/auth/callback/instagram`;
  const isConnected = settings?.instagram_connected || false;

  const connectInstagram = async () => {
    try {
      if (!settings?.instagram_app_id || !settings?.instagram_app_secret) {
        toast({
          title: "Fehlende Zugangsdaten",
          description: "Bitte geben Sie die Instagram App ID und das App Secret ein",
          variant: "destructive",
        });
        return;
      }

      const scope = [
        'email',
        'public_profile'
      ].join(',');

      const state = crypto.randomUUID();
      localStorage.setItem('instagram_oauth_state', state);

      const params = new URLSearchParams({
        client_id: settings.instagram_app_id,
        redirect_uri: redirectUri,
        scope: scope,
        response_type: 'code',
        state: state
      });

      window.location.href = `https://www.facebook.com/v18.0/dialog/oauth?${params.toString()}`;
    } catch (error) {
      console.error('Error connecting to Instagram:', error);
      toast({
        title: "Fehler bei der Instagram-Verbindung",
        description: "Bitte versuchen Sie es später erneut",
        variant: "destructive",
      });
    }
  };

  const disconnectInstagram = async () => {
    try {
      await updateSettings('instagram_auth_token', null);
      await updateSettings('instagram_connected', false);
      
      toast({
        title: "Instagram getrennt",
        description: "Ihre Instagram-Verbindung wurde erfolgreich getrennt",
      });
    } catch (error) {
      console.error('Error disconnecting from Instagram:', error);
      toast({
        title: "Fehler beim Trennen",
        description: "Bitte versuchen Sie es später erneut",
        variant: "destructive",
      });
    }
  };

  const handleUpdateCredentials = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const appId = formData.get('instagram_app_id') as string;
    const appSecret = formData.get('instagram_app_secret') as string;

    if (!appId || !appSecret) {
      toast({
        title: "Fehlende Eingaben",
        description: "Bitte füllen Sie alle Felder aus",
        variant: "destructive",
      });
      return;
    }

    await updateSettings('instagram_app_id', appId);
    await updateSettings('instagram_app_secret', appSecret);

    toast({
      title: "Erfolg",
      description: "Instagram Zugangsdaten wurden gespeichert",
    });
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Instagram className="h-6 w-6 text-[#E4405F]" />
          <h3 className="text-lg font-medium">Instagram Integration</h3>
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
                <form onSubmit={handleUpdateCredentials} className="space-y-4">
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
                  <Button type="submit" className="w-full">
                    Zugangsdaten Speichern
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">Trennen</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Instagram-Verbindung trennen?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Sind Sie sicher, dass Sie die Verbindung zu Instagram trennen möchten? 
                    Sie können sich jederzeit wieder verbinden.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                  <AlertDialogAction onClick={disconnectInstagram}>
                    Trennen
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        ) : (
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
              <form onSubmit={handleUpdateCredentials} className="space-y-4">
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
                  <Button type="button" onClick={connectInstagram} className="flex-1">
                    Mit Instagram verbinden
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>
      <p className="text-sm text-muted-foreground">
        Verbinden Sie Ihr Instagram-Konto um Leads automatisch zu kontaktieren und
        Nachrichten zu versenden.
      </p>
    </Card>
  );
}