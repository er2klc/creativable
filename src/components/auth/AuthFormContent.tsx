import { Button } from "@/components/ui/button";
import { LoginForm } from "./LoginForm";
import { RegistrationForm } from "./RegistrationForm";
import { SocialLoginButtons } from "./SocialLoginButtons";
import { useAuthFormState } from "@/hooks/auth/use-auth-form-state";
import { useAuthForm } from "@/hooks/use-auth-form";
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { LoginFormData } from "@/hooks/auth/use-login";
import { RegistrationData } from "@/hooks/auth/use-registration";
import { useAuth } from "@/hooks/use-auth";

export const AuthFormContent = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
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
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);

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
      setFormData({
        name: "",
        email: "",
        password: "",
        phoneNumber: "",
        language: "Deutsch",
      } as RegistrationData);
    } else {
      setFormData({
        email: "",
        password: "",
      } as LoginFormData);
    }
    navigate("/auth", { replace: true, state: { isSignUp: !isSignUp } });
  };

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {isSignUp ? (
        <RegistrationForm
          registrationStep={registrationStep}
          formData={formData as RegistrationData}
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
          formData={formData as LoginFormData}
          isLoading={isLoading}
          onInputChange={handleInputChange}
        />
      )}

      <Button
        type="submit"
        className="w-full bg-white/10 hover:bg-white/20 text-white border border-white/20 shadow-lg backdrop-blur-sm transition-all"
        variant="glassy"
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
        <>
          <div className="relative flex items-center gap-3">
            <div className="h-[1px] flex-1 bg-white/10" />
            <span className="text-sm text-gray-400">oder anmelden mit</span>
            <div className="h-[1px] flex-1 bg-white/10" />
          </div>
          <SocialLoginButtons
            onGoogleLogin={() => handleSocialLogin("google")}
            onAppleLogin={() => handleSocialLogin("apple")}
            isLoading={isLoading}
          />
        </>
      )}

      {isSignUp && registrationStep === 2 && (
        <Button
          type="button"
          variant="outline"
          className="w-full border-white/10 text-white hover:bg-white/5"
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
          className="text-sm text-gray-400 hover:text-white hover:underline"
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