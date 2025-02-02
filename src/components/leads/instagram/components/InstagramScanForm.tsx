import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, Instagram } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface InstagramScanFormProps {
  username: string;
  setUsername: (username: string) => void;
  isLoading: boolean;
  isSuccess: boolean;
  onSubmit: () => void;
  onCancel: () => void;
  contactType: string;
  setContactType: (type: string) => void;
}

export function InstagramScanForm({
  username,
  setUsername,
  isLoading,
  isSuccess,
  onSubmit,
  onCancel,
  contactType,
  setContactType
}: InstagramScanFormProps) {
  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(); }} className="space-y-6">
      <div className="flex flex-col items-center text-center space-y-3 pb-4">
        <div className="h-12 w-12 bg-pink-100 rounded-full flex items-center justify-center">
          <Instagram className="h-6 w-6 text-pink-500" />
        </div>
        <div>
          <h2 className="text-lg font-semibold">Instagram Kontakt hinzufügen</h2>
          <p className="text-sm text-muted-foreground">
            Gib den Instagram Benutzernamen ein, um das Profil zu scannen und als Kontakt hinzuzufügen
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="username">Instagram Benutzername</Label>
          <div className="relative">
            <span className="absolute left-3 top-2.5 text-muted-foreground">@</span>
            <Input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value.trim())}
              placeholder="username"
              className="pl-8"
              disabled={isLoading}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Kontakttyp</Label>
          <RadioGroup
            value={contactType}
            onValueChange={setContactType}
            className="flex gap-4"
          >
            <div className={`flex items-center space-x-2 rounded-lg p-2 transition-colors ${
              contactType === "Partner" ? "bg-[#E5DEFF]/30" : ""
            }`}>
              <RadioGroupItem value="Partner" id="partner" />
              <Label htmlFor="partner" className="cursor-pointer">Likely Partner</Label>
            </div>
            <div className={`flex items-center space-x-2 rounded-lg p-2 transition-colors ${
              contactType === "Kunde" ? "bg-[#F2FCE2]/30" : ""
            }`}>
              <RadioGroupItem value="Kunde" id="kunde" />
              <Label htmlFor="kunde" className="cursor-pointer">Likely Kunde</Label>
            </div>
          </RadioGroup>
        </div>
      </div>
      
      {isSuccess && (
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle className="h-4 w-4 text-green-500" />
          <AlertDescription className="mt-2 text-green-700">
            Kontakt erfolgreich erstellt!
          </AlertDescription>
        </Alert>
      )}

      <div className="flex justify-end space-x-2 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
        >
          Abbrechen
        </Button>
        <Button type="submit" disabled={isLoading || !username || !contactType}>
          {isLoading ? "Wird geladen..." : "Kontakt hinzufügen"}
        </Button>
      </div>
    </form>
  );
}