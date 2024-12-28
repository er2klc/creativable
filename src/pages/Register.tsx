import { AuthCard } from "@/components/auth/AuthCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const Register = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phoneNumber: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (formData.password !== formData.confirmPassword) {
        throw new Error("Passwörter stimmen nicht überein");
      }

      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.name,
            phone: formData.phoneNumber,
          },
        },
      });

      if (error) throw error;

      if (data) {
        // Create initial settings with phone number
        const { error: settingsError } = await supabase
          .from('settings')
          .insert({
            user_id: data.user?.id,
            language: "Deutsch",
            whatsapp_number: formData.phoneNumber,
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
            minLength={8}
          />
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
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phoneNumber">Telefonnummer</Label>
          <Input
            id="phoneNumber"
            name="phoneNumber"
            type="tel"
            placeholder="+49 123 4567890"
            value={formData.phoneNumber}
            onChange={handleInputChange}
            disabled={isLoading}
            required
          />
        </div>

        <Button
          type="submit"
          className="w-full"
          disabled={isLoading || formData.password !== formData.confirmPassword}
        >
          {isLoading ? "Laden..." : "Registrieren"}
        </Button>

        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={() => navigate("/auth")}
            className="text-sm text-muted-foreground hover:underline"
          >
            Bereits registriert? Hier anmelden
          </button>
        </div>
      </form>
    </AuthCard>
  );
};

export default Register;