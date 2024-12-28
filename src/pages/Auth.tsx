import { AuthCard } from "@/components/auth/AuthCard";
import { AuthStateHandler } from "@/components/auth/AuthStateHandler";
import { AILoadingAnimation } from "@/components/auth/AILoadingAnimation";
import { RegistrationSuccess } from "@/components/auth/RegistrationSuccess";
import { AuthFormContent } from "@/components/auth/AuthFormContent";
import { useAuthFormState } from "@/hooks/auth/use-auth-form-state";

const Auth = () => {
  const {
    showAILoading,
    showSuccess,
    isSignUp,
    registrationStep,
  } = useAuthFormState();

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
        <AuthFormContent />
      </AuthCard>
    </>
  );
};

export default Auth;