import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { LoginForm } from "@/components/auth/LoginForm";
import { RegistrationForm } from "@/components/auth/RegistrationForm";
import { useAuthForm } from "@/hooks/use-auth-form";
import { FcGoogle } from "react-icons/fc";
import { FaApple } from "react-icons/fa";

const Auth = () => {
  const session = useSession();
  const navigate = useNavigate();
  const supabase = useSupabaseClient();
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

  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback/google`,
        },
      });
      if (error) throw error;
    } catch (error: any) {
      console.error('Google login error:', error);
      toast.error("Fehler beim Anmelden mit Google. Bitte versuchen Sie es später erneut.");
    }
  };

  const handleAppleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'apple',
        options: {
          redirectTo: `${window.location.origin}/auth/callback/apple`,
        },
      });
      if (error) throw error;
    } catch (error: any) {
      console.error('Apple login error:', error);
      toast.error("Fehler beim Anmelden mit Apple. Bitte versuchen Sie es später erneut.");
    }
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

            {!isSignUp && (
              <div className="space-y-2">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                      Oder anmelden mit
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleGoogleLogin}
                    disabled={isLoading}
                  >
                    <FcGoogle className="h-5 w-5 mr-2" />
                    Google
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleAppleLogin}
                    disabled={isLoading}
                  >
                    <FaApple className="h-5 w-5 mr-2" />
                    Apple
                  </Button>
                </div>
              </div>
            )}

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