import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Key, Copy, AlertCircle, Unlink, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface LinkedInCredentialsFormProps {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  onClientIdChange: (value: string) => void;
  onClientSecretChange: (value: string) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  onConnect: () => void;
  onDisconnect: () => void;
  onCopyRedirectUri: () => void;
  error?: string;
  isConnected: boolean;
  isLoading?: boolean;
}

export function LinkedInCredentialsForm({
  clientId,
  clientSecret,
  redirectUri,
  onClientIdChange,
  onClientSecretChange,
  onSubmit,
  onConnect,
  onDisconnect,
  onCopyRedirectUri,
  error,
  isConnected,
  isLoading = false,
}: LinkedInCredentialsFormProps) {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit(e);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <div className="space-y-2">
        <Label htmlFor="linkedin_client_id">LinkedIn Client ID</Label>
        <div className="flex gap-2">
          <Key className="h-4 w-4 mt-3 text-muted-foreground" />
          <Input
            id="linkedin_client_id"
            name="linkedin_client_id"
            value={clientId}
            onChange={(e) => onClientIdChange(e.target.value)}
            placeholder="77xxxxxxxxxxxxx"
            disabled={isLoading}
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="linkedin_client_secret">LinkedIn Client Secret</Label>
        <div className="flex gap-2">
          <Key className="h-4 w-4 mt-3 text-muted-foreground" />
          <Input
            id="linkedin_client_secret"
            name="linkedin_client_secret"
            type="password"
            value={clientSecret}
            onChange={(e) => onClientSecretChange(e.target.value)}
            placeholder="••••••••"
            disabled={isLoading}
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Redirect URI</Label>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onCopyRedirectUri}
            className="h-8"
            disabled={isLoading}
          >
            <Copy className="h-4 w-4" />
          </Button>
        </div>
        <code className="block p-2 bg-muted rounded-md text-sm break-all">
          {redirectUri}
        </code>
        <p className="text-sm text-muted-foreground mt-2">
          Wichtig: Fügen Sie diese exakte URI zu Ihrer LinkedIn App unter "OAuth 2.0 settings" → "Authorized redirect URLs" hinzu
        </p>
      </div>
      
      <div className="flex gap-2">
        <Button type="submit" className="flex-1" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Wird gespeichert...
            </>
          ) : (
            'Zugangsdaten Speichern'
          )}
        </Button>
        {isConnected ? (
          <Button 
            type="button"
            variant="destructive"
            onClick={onDisconnect}
            className="flex items-center gap-2"
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Unlink className="h-4 w-4" />
            )}
            Verbindung trennen
          </Button>
        ) : (
          <Button 
            type="button" 
            onClick={onConnect} 
            className="flex-1"
            disabled={!clientId || !clientSecret || isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Verbinde...
              </>
            ) : (
              'Mit LinkedIn verbinden'
            )}
          </Button>
        )}
      </div>
    </form>
  );
}