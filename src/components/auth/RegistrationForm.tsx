import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface RegistrationFormProps {
  registrationStep: number;
  formData: {
    name: string;
    email: string;
    password: string;
    companyName: string;
    phoneNumber: string;
    language: string;
  };
  isLoading: boolean;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onLanguageChange: (value: string) => void;
}

const languages = [
  { value: "Deutsch", label: "🇩🇪 Deutsch" },
  { value: "English", label: "🇬🇧 English" },
  { value: "Français", label: "🇫🇷 Français" },
  { value: "Español", label: "🇪🇸 Español" },
  { value: "Italiano", label: "🇮🇹 Italiano" },
  { value: "Türkçe", label: "🇹🇷 Türkçe" },
];

export const RegistrationForm = ({
  registrationStep,
  formData,
  isLoading,
  onInputChange,
  onLanguageChange,
}: RegistrationFormProps) => {
  if (registrationStep === 1) {
    return (
      <>
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            name="name"
            type="text"
            placeholder="Ihr vollständiger Name"
            value={formData.name}
            onChange={onInputChange}
            disabled={isLoading}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">E-Mail</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="name@example.com"
            value={formData.email}
            onChange={onInputChange}
            disabled={isLoading}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phoneNumber">Telefonnummer</Label>
          <Input
            id="phoneNumber"
            name="phoneNumber"
            type="tel"
            placeholder="+49 123 45678900"
            value={formData.phoneNumber}
            onChange={onInputChange}
            disabled={isLoading}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Passwort</Label>
          <Input
            id="password"
            name="password"
            type="password"
            placeholder="••••••••"
            value={formData.password}
            onChange={onInputChange}
            disabled={isLoading}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="language">Sprache</Label>
          <Select
            value={formData.language}
            onValueChange={onLanguageChange}
            disabled={isLoading}
          >
            <SelectTrigger>
              <SelectValue placeholder="Wählen Sie Ihre Sprache" />
            </SelectTrigger>
            <SelectContent>
              {languages.map((language) => (
                <SelectItem key={language.value} value={language.value}>
                  {language.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </>
    );
  }

  return (
    <div className="space-y-2">
      <Label htmlFor="companyName">Firmenname</Label>
      <Input
        id="companyName"
        name="companyName"
        type="text"
        placeholder="z.B. Zinzino"
        value={formData.companyName}
        onChange={onInputChange}
        disabled={isLoading}
      />
      <p className="text-sm text-muted-foreground">
        Wir verwenden KI, um relevante Informationen über Ihr Unternehmen zu sammeln und Ihr Profil zu optimieren.
      </p>
    </div>
  );
};