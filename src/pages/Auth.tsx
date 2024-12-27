import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface RegistrationStep {
  name: string;
  email: string;
  password: string;
  companyName: string;
}

const Auth = () => {
  const session = useSession();
  const supabase = useSupabaseClient();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [registrationStep, setRegistrationStep] = useState(1);
  const [formData, setFormData] = useState<RegistrationStep>({
    name: "",
    email: "",
    password: "",
    companyName: "",
  });
  const [isSignUp, setIsSignUp] = useState(false);

  useEffect(() => {
    if (session) {
      navigate("/dashboard");
    }
  }, [session, navigate]);

  const handleCompanyInfoFetch = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase.functions.invoke('fetch-company-info', {
        body: { companyName: formData.companyName }
      });

      if (error) throw error;

      // Update settings with company information
      const { error: settingsError } = await supabase
        .from('settings')
        .upsert({
          user_id: session?.user?.id,
          registration_company_name: formData.companyName,
          registration_completed: true,
          company_name: data.companyName,
          products_services: data.productsServices,
          target_audience: data.targetAudience,
          usp: data.usp,
          business_description: data.businessDescription,
        });

      if (settingsError) throw settingsError;

      toast.success("Registrierung erfolgreich abgeschlossen! ✨");
      navigate("/dashboard");
    } catch (error: any) {
      console.error("Error fetching company info:", error);
      toast.error("Fehler beim Abrufen der Firmeninformationen");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isSignUp) {
        if (registrationStep === 1) {
          if (!formData.name || !formData.email || !formData.password) {
            toast.error("Bitte füllen Sie alle Felder aus");
            return;
          }
          setRegistrationStep(2);
        } else {
          if (!formData.companyName) {
            toast.error("Bitte geben Sie Ihren Firmennamen ein");
            return;
          }

          const { error } = await supabase.auth.signUp({
            email: formData.email,
            password: formData.password,
            options: {
              data: {
                full_name: formData.name,
              },
            },
          });

          if (error) throw error;

          await handleCompanyInfoFetch();
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });

        if (error) throw error;
        toast.success("Erfolgreich angemeldet! ✨");
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-[400px]">
        <CardHeader>
          <CardTitle>{isSignUp ? "Registrierung" : "Anmeldung"}</CardTitle>
          <CardDescription>
            {isSignUp
              ? registrationStep === 1
                ? "Erstellen Sie Ihr Konto"
                : "Geben Sie Ihre Firmeninformationen ein"
              : "Melden Sie sich an"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && registrationStep === 1 && (
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Ihr vollständiger Name"
                  value={formData.name}
                  onChange={handleInputChange}
                  disabled={isLoading}
                />
              </div>
            )}

            {(!isSignUp || registrationStep === 1) && (
              <>
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
                  />
                </div>
              </>
            )}

            {isSignUp && registrationStep === 2 && (
              <div className="space-y-2">
                <Label htmlFor="companyName">Firmenname</Label>
                <Input
                  id="companyName"
                  name="companyName"
                  type="text"
                  placeholder="z.B. Zinzino"
                  value={formData.companyName}
                  onChange={handleInputChange}
                  disabled={isLoading}
                />
                <p className="text-sm text-muted-foreground">
                  Wir verwenden KI, um relevante Informationen über Ihr Unternehmen zu sammeln und Ihr Profil zu optimieren.
                </p>
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : isSignUp ? (
                registrationStep === 1 ? "Weiter" : "Registrieren"
              ) : (
                "Anmelden"
              )}
            </Button>

            {registrationStep === 2 && (
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => setRegistrationStep(1)}
                disabled={isLoading}
              >
                Zurück
              </Button>
            )}
          </form>

          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setRegistrationStep(1);
              }}
              className="text-sm text-muted-foreground hover:underline"
              disabled={isLoading}
            >
              {isSignUp
                ? "Bereits registriert? Hier anmelden"
                : "Noch kein Account? Hier registrieren"}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;