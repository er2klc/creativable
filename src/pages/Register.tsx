import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from "@/integrations/supabase/client";
import { AuthCard } from "@/components/auth/AuthCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

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
            display_name: formData.name,
            full_name: formData.name,
          },
        },
      });

      if (error) {
        if (error.message?.includes('already registered')) {
          setShowLoginDialog(true);
          return;
        }
        throw error;
      }

      if (!data?.user?.id) {
        throw new Error("Fehler bei der Registrierung - keine Benutzer-ID erhalten");
      }

      toast.success("Registrierung erfolgreich! Bitte bestätigen Sie Ihre E-Mail-Adresse.");
      navigate("/auth");
      
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
          disabled={isLoading}
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