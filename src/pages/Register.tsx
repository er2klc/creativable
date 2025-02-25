import { AuthCard } from "@/components/auth/AuthCard";
import { Button } from "@/components/ui/button";
import { useState, useTransition } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { RegistrationForm } from "@/components/auth/RegistrationForm";

const Register = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      console.log("Starting registration process with:", {
        email: formData.email,
        name: formData.name
      });
      
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            name: formData.name // Pass name directly in user metadata
          }
        }
      });

      if (error) {
        console.error('Registration error:', error);
        if (error.message?.includes('already registered')) {
          setShowLoginDialog(true);
          return;
        }
        throw error;
      }

      if (!data.user) {
        throw new Error("Fehler bei der Registrierung");
      }

      toast.success("Registrierung erfolgreich! Bitte bestätigen Sie Ihre E-Mail-Adresse.");
      startTransition(() => {
        navigate("/auth");
      });
    } catch (error: any) {
      console.error('Registration error:', error);
      toast.error(error.message || "Ein unerwarteter Fehler ist aufgetreten");
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
        <RegistrationForm
          registrationStep={1}
          formData={formData}
          isLoading={isLoading}
          onInputChange={handleInputChange}
        />

        <Button
          type="submit"
          className="w-full bg-white/10 hover:bg-white/20 text-white border border-white/20 shadow-lg backdrop-blur-sm relative after:absolute after:bottom-0 after:left-0 after:h-[1px] after:w-full after:bg-gradient-to-r after:from-red-500 after:via-yellow-500 after:to-blue-500"
          disabled={isLoading || isPending}
        >
          {isLoading ? "Laden..." : "Registrieren"}
        </Button>

        <div className="mt-4 text-center">
          <Button
            type="button"
            variant="link"
            className="text-sm text-gray-400 hover:text-white hover:underline"
            onClick={() => {
              startTransition(() => {
                navigate("/auth");
              });
            }}
            disabled={isLoading || isPending}
          >
            Bereits registriert? Hier anmelden
          </Button>
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
                startTransition(() => {
                  navigate("/auth", { state: { initialEmail: formData.email } });
                });
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
