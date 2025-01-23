import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2, XCircle } from "lucide-react";

interface RegistrationFormProps {
  registrationStep: number;
  formData: {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
  };
  isLoading: boolean;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const passwordRequirements = [
  { check: (pwd: string) => pwd.length >= 8, label: "Mindestens 8 Zeichen" },
  { check: (pwd: string) => /[A-Z]/.test(pwd), label: "Ein Großbuchstabe" },
  { check: (pwd: string) => /[0-9]/.test(pwd), label: "Eine Zahl" },
  { check: (pwd: string) => /[!@#$%^&*(),.?":{}|<>\-]/.test(pwd), label: "Ein Sonderzeichen" },
];

export const RegistrationForm = ({
  registrationStep,
  formData,
  isLoading,
  onInputChange,
}: RegistrationFormProps) => {
  const [passwordStrength, setPasswordStrength] = useState<{
    [key: string]: boolean;
  }>({});

  useEffect(() => {
    const strength = passwordRequirements.reduce((acc, req) => ({
      ...acc,
      [req.label]: req.check(formData.password),
    }), {});
    setPasswordStrength(strength);
  }, [formData.password]);

  const isPasswordValid = Object.values(passwordStrength).every(Boolean);
  const doPasswordsMatch = formData.password === formData.confirmPassword;

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
          required
          className="bg-white/5 border-white/10 text-white placeholder:text-gray-400"
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
          required
          className="bg-white/5 border-white/10 text-white placeholder:text-gray-400"
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
          required
          className="bg-white/5 border-white/10 text-white placeholder:text-gray-400"
        />
        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
          {passwordRequirements.map(({ label }) => (
            <div key={label} className="flex items-center gap-2 transition-opacity duration-200" style={{ opacity: passwordStrength[label] ? 1 : 0.5 }}>
              {passwordStrength[label] ? (
                <CheckCircle2 className="h-4 w-4 text-green-500 transition-transform duration-200 animate-in fade-in-0" />
              ) : (
                <XCircle className="h-4 w-4 text-gray-400" />
              )}
              <span>{label}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Passwort bestätigen</Label>
        <Input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          placeholder="••••••••"
          value={formData.confirmPassword}
          onChange={onInputChange}
          disabled={isLoading}
          required
          className="bg-white/5 border-white/10 text-white placeholder:text-gray-400"
        />
        {formData.confirmPassword && !doPasswordsMatch && (
          <Alert variant="destructive">
            <AlertDescription>
              Die Passwörter stimmen nicht überein
            </AlertDescription>
          </Alert>
        )}
      </div>
    </>
  );
};