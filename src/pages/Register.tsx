import { AuthCard } from "@/components/auth/AuthCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { CheckCircle2, XCircle } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const passwordRequirements = [
  { check: (pwd: string) => pwd.length >= 8, label: "Mindestens 8 Zeichen" },
  { check: (pwd: string) => /[A-Z]/.test(pwd), label: "Ein Großbuchstabe" },
  { check: (pwd: string) => /[0-9]/.test(pwd), label: "Eine Zahl" },
  { check: (pwd: string) => /[!@#$%^&*(),.?":{}|<>\-]/.test(pwd), label: "Ein Sonderzeichen" },
];

const Register = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [passwordStrength, setPasswordStrength] = useState<{
    [key: string]: boolean;
  }>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    if (name === "password") {
      const strength = passwordRequirements.reduce(
        (acc, req) => ({
          ...acc,
          [req.label]: req.check(value),
        }),
        {}
      );
      setPasswordStrength(strength);
    }
  };

  const isPasswordValid = Object.values(passwordStrength).every(Boolean);
  const doPasswordsMatch = formData.password === formData.confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (!isPasswordValid) {
        throw new Error("Passwort erfüllt nicht alle Anforderungen");
      }

      if (!doPasswordsMatch) {
        throw new Error("Passwörter stimmen nicht überein");
      }

      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.name,
          },
        },
      });

      if (error) {
        if (error.message?.includes('already registered')) {
          setShowLoginDialog(true);
          setIsLoading(false);
          return;
        }
        throw error;
      }

      if (data?.user) {
        const { error: settingsError } = await supabase
          .from('settings')
          .insert({
            user_id: data.user.id,
            language: "Deutsch",
          });

        if (settingsError) throw settingsError;

        toast.success("Registrierung erfolgreich! Bitte bestätigen Sie Ihre E-Mail-Adresse.");
        navigate("/auth");
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      toast.error(error.message || "Ein Fehler ist aufgetreten");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthCard
      title="Registrierung"
      description="Erstellen Sie Ihr Konto"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            name="name"
            type="text"
            placeholder="Max Mustermann"
            value={formData.name}
            onChange={handleInputChange}
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
            onChange={handleInputChange}
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
            onChange={handleInputChange}
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
            onChange={handleInputChange}
            disabled={isLoading}
            required
            className="bg-white/5 border-white/10 text-white placeholder:text-gray-400"
          />
        </div>

        <Button
          type="submit"
          className="w-full bg-white/10 hover:bg-white/20 text-white border border-white/20 shadow-lg backdrop-blur-sm relative after:absolute after:bottom-0 after:left-0 after:h-[1px] after:w-full after:bg-gradient-to-r after:from-red-500 after:via-yellow-500 after:to-blue-500"
          disabled={isLoading || !isPasswordValid || !doPasswordsMatch}
        >
          {isLoading ? "Laden..." : "Registrieren"}
        </Button>

        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={() => navigate("/auth")}
            className="text-sm text-gray-400 hover:text-white hover:underline"
          >
            Bereits registriert? Hier anmelden
          </button>
        </div>
      </form>

      <Dialog open={showLoginDialog} onOpenChange={setShowLoginDialog}>
        <DialogContent className="bg-[#1A1F2C]/95 border-white/10 text-white backdrop-blur-sm">
          <DialogHeader>
            <DialogTitle>Account bereits vorhanden</DialogTitle>
            <DialogDescription className="text-gray-300">
              Diese E-Mail-Adresse ist bereits registriert. Möchten Sie sich stattdessen anmelden?
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end space-x-4 mt-4">
            <Button
              variant="outline"
              onClick={() => setShowLoginDialog(false)}
              className="border-white/10 text-white hover:bg-white/5"
            >
              Abbrechen
            </Button>
            <Button
              onClick={() => {
                setShowLoginDialog(false);
                navigate("/auth", { state: { initialEmail: formData.email } });
              }}
              className="bg-white/10 hover:bg-white/20 text-white border border-white/20"
            >
              Zum Login
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </AuthCard>
  );
};

export default Register;