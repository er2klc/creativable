import { AuthCard } from "@/components/auth/AuthCard";
import { AuthStateHandler } from "@/components/auth/AuthStateHandler";
import { AILoadingAnimation } from "@/components/auth/AILoadingAnimation";
import { RegistrationSuccess } from "@/components/auth/RegistrationSuccess";
import { AuthFormContent } from "@/components/auth/AuthFormContent";
import { useAuthFormState } from "@/hooks/auth/use-auth-form-state";
import { useLocation } from "react-router-dom";

const Auth = () => {
  const location = useLocation();
  const {
    showAILoading,
    showSuccess,
    isSignUp,
    registrationStep,
  } = useAuthFormState();

  const state = location.state as { isSignUp?: boolean } | null;
  const isRegistering = state?.isSignUp || isSignUp;

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
        title={isRegistering ? "Registrierung" : "Anmeldung"}
        description={
          isRegistering
            ? registrationStep === 1
              ? "Erstellen Sie Ihr Konto"
              : "Vervollständigen Sie Ihre Registrierung"
            : "Melden Sie sich an"
        }
      >
        <AuthFormContent />
      </AuthCard>
    </>
  );
};

export default Auth;