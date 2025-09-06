import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Linkedin } from "lucide-react";

interface LinkedInScanFormProps {
  username: string;
  setUsername: (username: string) => void;
  isLoading: boolean;
  isSuccess: boolean;
  onSubmit: () => void;
  onCancel: () => void;
  contactType: string;
  setContactType: (type: string) => void;
}

export function LinkedInScanForm({
  username,
  setUsername,
  isLoading,
  isSuccess,
  onSubmit,
  onCancel
}: LinkedInScanFormProps) {
  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(); }} className="space-y-6">
      <div className="flex flex-col items-center text-center space-y-3 pb-4">
        <div className="h-12 w-12 bg-[#E7F1FF] rounded-full flex items-center justify-center">
          <Linkedin className="h-6 w-6 text-[#0A66C2]" />
        </div>
        <div>
          <h2 className="text-lg font-semibold">LinkedIn Kontakt hinzufügen</h2>
          <p className="text-sm text-muted-foreground">
            Gib den LinkedIn Benutzernamen ein, um das Profil zu scannen und als Kontakt hinzuzufügen
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="username">LinkedIn Benutzername</Label>
          <Input
            id="username"
            placeholder="username (ohne URL)"
            value={username}
            onChange={(e) => setUsername(e.target.value.trim())}
            disabled={isLoading}
          />
        </div>
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
        >
          Abbrechen
        </Button>
        <Button type="submit" disabled={isLoading || !username}>
          {isLoading ? "Wird geladen..." : "Kontakt hinzufügen"}
        </Button>
      </div>
    </form>
  );
}