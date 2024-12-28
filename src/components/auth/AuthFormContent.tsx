import { Button } from "@/components/ui/button";
import { LoginForm } from "./LoginForm";
import { RegistrationForm } from "./RegistrationForm";
import { SocialLoginButtons } from "./SocialLoginButtons";
import { useAuthFormState } from "@/hooks/auth/use-auth-form-state";
import { useAuthForm } from "@/hooks/use-auth-form";
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";

export const AuthFormContent = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const {
    isSignUp,
    setIsSignUp,
    registrationStep,
    setRegistrationStep,
    handleSocialLogin,
  } = useAuthFormState();

  const {
    isLoading,
    formData,
    handleSubmit,
    handleInputChange,
    cooldownRemaining,
    setFormData,
  } = useAuthForm();

  useEffect(() => {
    const state = location.state as { isSignUp?: boolean; initialEmail?: string } | null;
    if (state?.isSignUp !== undefined) {
      setIsSignUp(state.isSignUp);
    }
    if (state?.initialEmail) {
      setFormData((prev) => ({ ...prev, email: state.initialEmail }));
    }
  }, [location.state, setIsSignUp, setFormData]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await handleSubmit(e);

    if (success && isSignUp && registrationStep === 1) {
      setRegistrationStep(2);
    }
  };

  const handleToggleMode = () => {
    setIsSignUp(!isSignUp);
    setRegistrationStep(1);
    if (!isSignUp) {
      // Switching to registration
      setFormData({
        name: "",
        email: "",
        password: "",
        phoneNumber: "",
        language: "Deutsch",
      });
    } else {
      // Switching to login
      setFormData({
        email: "",
        password: "",
      });
    }
    navigate("/auth", { replace: true, state: { isSignUp: !isSignUp } });
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {isSignUp ? (
        <RegistrationForm
          registrationStep={registrationStep}
          formData={formData}
          isLoading={isLoading}
          onInputChange={handleInputChange}
          onLanguageChange={(value) =>
            handleInputChange({
              target: { name: "language", value },
            } as React.ChangeEvent<HTMLInputElement>)
          }
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
          registrationStep === 1 ? "Weiter" : "Account erstellen"
        ) : (
          "Anmelden"
        )}
      </Button>

      {!isSignUp && (
        <SocialLoginButtons
          onGoogleLogin={() => handleSocialLogin("google")}
          onAppleLogin={() => handleSocialLogin("apple")}
          isLoading={isLoading}
        />
      )}

      {isSignUp && registrationStep === 2 && (
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

      <div className="mt-4 text-center">
        <button
          type="button"
          onClick={handleToggleMode}
          className="text-sm text-muted-foreground hover:underline"
          disabled={isLoading}
        >
          {isSignUp
            ? "Bereits registriert? Hier anmelden"
            : "Noch kein Account? Hier registrieren"}
        </button>
      </div>
    </form>
  );
};