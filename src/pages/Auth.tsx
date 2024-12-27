import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { LoginForm } from "@/components/auth/LoginForm";
import { RegistrationForm } from "@/components/auth/RegistrationForm";
import { AILoadingAnimation } from "@/components/auth/AILoadingAnimation";
import { RegistrationSuccess } from "@/components/auth/RegistrationSuccess";
import { useAuthForm, LoginFormData, RegistrationFormData } from "@/hooks/use-auth-form";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { toast } from "sonner";
import { AuthCard } from "@/components/auth/AuthCard";
import { SocialLoginButtons } from "@/components/auth/SocialLoginButtons";

const Auth = () => {
  const supabase = useSupabaseClient();
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSignUp && registrationStep === 2) {
      setShowAILoading(true);
      try {
        const result = await originalHandleSubmit(e);
        if (result) {
          setTimeout(() => {
            setShowAILoading(false);
            setShowSuccess(true);
          }, 3000);
        } else {
          setShowAILoading(false);
        }
      } catch (error) {
        setShowAILoading(false);
        throw error;
      }
    } else {
      await originalHandleSubmit(e);
    }
  };

  const handleLanguageChange = (value: string) => {
    // We need to simulate an input change event to work with the existing handleInputChange
    const event = {
      target: {
        name: 'language',
        value: value
      }
    } as React.ChangeEvent<HTMLInputElement>;
    
    handleInputChange(event);
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
            formData={formData as RegistrationFormData}
            isLoading={isLoading}
            onInputChange={handleInputChange}
            onLanguageChange={handleLanguageChange}
          />
        ) : (
          <LoginForm
            formData={formData as LoginFormData}
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
            onGoogleLogin={handleGoogleLogin}
            onAppleLogin={handleAppleLogin}
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
  );
};

export default Auth;