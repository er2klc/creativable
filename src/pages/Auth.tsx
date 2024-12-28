import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { LoginForm } from "@/components/auth/LoginForm";
import { RegistrationForm } from "@/components/auth/RegistrationForm";
import { AILoadingAnimation } from "@/components/auth/AILoadingAnimation";
import { RegistrationSuccess } from "@/components/auth/RegistrationSuccess";
import { useAuthForm } from "@/hooks/use-auth-form";
import { AuthCard } from "@/components/auth/AuthCard";
import { SocialLoginButtons } from "@/components/auth/SocialLoginButtons";
import { useLocation } from "react-router-dom";
import { AuthStateHandler } from "@/components/auth/AuthStateHandler";
import { useSessionManagement } from "@/hooks/auth/use-session-management";

const Auth = () => {
  const location = useLocation();
  const { handleSessionError } = useSessionManagement();
  const [showAILoading, setShowAILoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  
  const {
    isLoading,
    registrationStep,
    formData,
    isSignUp,
    handleSubmit: originalHandleSubmit,
    handleInputChange,
    setIsSignUp,
    setRegistrationStep,
    cooldownRemaining,
  } = useAuthForm();

  useEffect(() => {
    const state = location.state as { isSignUp?: boolean; email?: string } | null;
    if (state?.isSignUp) {
      setIsSignUp(true);
      if (state.email) {
        handleInputChange({
          target: { name: 'email', value: state.email }
        } as React.ChangeEvent<HTMLInputElement>);
      }
    }
  }, [location.state, setIsSignUp]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (isSignUp && registrationStep === 2) {
        setShowAILoading(true);
        const result = await originalHandleSubmit(e);
        if (result) {
          setTimeout(() => {
            setShowAILoading(false);
            setShowSuccess(true);
          }, 3000);
        } else {
          setShowAILoading(false);
        }
      } else {
        await originalHandleSubmit(e);
      }
    } catch (error: any) {
      if (error?.code === "session_not_found") {
        await handleSessionError(error);
      } else {
        throw error;
      }
    }
  };

  if (showSuccess) {
    return <RegistrationSuccess />;
  }

  if (showAILoading) {
    return (
      <AuthCard 
        title="Daten werden verarbeitet" 
        description="Bitte warten Sie, während wir Ihre Daten verarbeiten."
      >
        <AILoadingAnimation />
      </AuthCard>
    );
  }

  return (
    <>
      <AuthStateHandler />
      <AuthCard
        title={isSignUp ? "Registrierung" : "Anmeldung"}
        description={
          isSignUp
            ? registrationStep === 1
              ? "Erstellen Sie Ihr Konto"
              : "Geben Sie Ihre Firmeninformationen ein"
            : "Melden Sie sich an"
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignUp ? (
            <RegistrationForm
              registrationStep={registrationStep}
              formData={formData}
              isLoading={isLoading}
              onInputChange={handleInputChange}
              onLanguageChange={(value) => {
                handleInputChange({
                  target: { name: 'language', value }
                } as React.ChangeEvent<HTMLInputElement>);
              }}
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
              <span>Laden...</span>
            ) : cooldownRemaining > 0 ? (
              `Bitte warten (${cooldownRemaining}s)`
            ) : isSignUp ? (
              registrationStep === 1 ? "Weiter" : "Registrieren"
            ) : (
              "Anmelden"
            )}
          </Button>

          {!isSignUp && (
            <SocialLoginButtons
              onGoogleLogin={async () => {
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
                  if (error?.code === "session_not_found") {
                    await handleSessionError(error);
                  } else {
                    throw error;
                  }
                }
              }}
              onAppleLogin={async () => {
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
                  if (error?.code === "session_not_found") {
                    await handleSessionError(error);
                  } else {
                    throw error;
                  }
                }
              }}
              isLoading={isLoading}
            />
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
      </AuthCard>
    </>
  );
};

export default Auth;