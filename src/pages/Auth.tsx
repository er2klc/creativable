import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSession } from "@supabase/auth-helpers-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { LoginForm } from "@/components/auth/LoginForm";
import { RegistrationForm } from "@/components/auth/RegistrationForm";
import { useAuthForm } from "@/hooks/use-auth-form";

const Auth = () => {
  const session = useSession();
  const navigate = useNavigate();
  const {
    isLoading,
    registrationStep,
    formData,
    isSignUp,
    handleSubmit,
    handleInputChange,
    setIsSignUp,
    setRegistrationStep,
    cooldownRemaining,
  } = useAuthForm();

  useEffect(() => {
    if (session) {
      navigate("/dashboard");
    }
  }, [session, navigate]);

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
            {isSignUp ? (
              <RegistrationForm
                registrationStep={registrationStep}
                formData={formData}
                isLoading={isLoading}
                onInputChange={handleInputChange}
              />
            ) : (
              <LoginForm
                formData={formData}
                isLoading={isLoading}
                onInputChange={handleInputChange}
              />
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading || cooldownRemaining > 0}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : cooldownRemaining > 0 ? (
                `Bitte warten (${cooldownRemaining}s)`
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