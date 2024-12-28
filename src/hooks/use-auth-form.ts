import { useState, Dispatch, SetStateAction } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useRegistration, RegistrationData } from "./auth/use-registration";
import { useLogin, LoginFormData } from "./auth/use-login";

export type FormData = RegistrationData | LoginFormData;

export const useAuthForm = () => {
  const navigate = useNavigate();
  const [lastSubmitTime, setLastSubmitTime] = useState(0);
  const [cooldownEndTime, setCooldownEndTime] = useState(0);
  const [isSignUp, setIsSignUp] = useState(false);

  const {
    isLoading: registrationLoading,
    setIsLoading: setRegistrationLoading,
    registrationStep,
    setRegistrationStep,
    formData: registrationData,
    handleRegistration,
    handleInputChange: handleRegistrationInputChange,
    setFormData: setRegistrationFormData,
  } = useRegistration();

  const {
    isLoading: loginLoading,
    setIsLoading: setLoginLoading,
    formData: loginData,
    handleLogin,
    handleInputChange: handleLoginInputChange,
    setFormData: setLoginFormData,
  } = useLogin();

  const getRemainingCooldown = () => {
    if (cooldownEndTime === 0) return 0;
    const remaining = Math.ceil((cooldownEndTime - Date.now()) / 1000);
    return remaining > 0 ? remaining : 0;
  };

  const handleSubmit = async (e: React.FormEvent): Promise<boolean> => {
    e.preventDefault();
    
    const remainingCooldown = getRemainingCooldown();
    if (remainingCooldown > 0) {
      toast.error(`Bitte warten Sie noch ${remainingCooldown} Sekunden, bevor Sie es erneut versuchen.`);
      return false;
    }

    if (isSignUp) {
      setRegistrationLoading(true);
      setLastSubmitTime(Date.now());

      try {
        const data = registrationData;
        if (registrationStep === 1) {
          if (!data.name || !data.email || !data.password) {
            toast.error("Bitte füllen Sie alle Pflichtfelder aus");
            setRegistrationLoading(false);
            return false;
          }

          setRegistrationStep(2);
          setRegistrationLoading(false);
          return true;
        } else {
          if (!data.phoneNumber) {
            toast.error("Bitte geben Sie Ihre Telefonnummer ein");
            setRegistrationLoading(false);
            return false;
          }
          const success = await handleRegistration();
          setRegistrationLoading(false);
          return success;
        }
      } catch (error: any) {
        console.error('Registration error:', error);
        if (error.message.includes('rate_limit')) {
          const cooldownTime = Date.now() + 15000;
          setCooldownEndTime(cooldownTime);
          toast.error(`Bitte warten Sie ${getRemainingCooldown()} Sekunden, bevor Sie es erneut versuchen.`);
        } else {
          toast.error(error.message || "Ein unerwarteter Fehler ist aufgetreten");
        }
        setRegistrationLoading(false);
        return false;
      }
    } else {
      setLoginLoading(true);
      setLastSubmitTime(Date.now());

      try {
        const data = loginData;
        if (!data.email || !data.password) {
          toast.error("Bitte füllen Sie E-Mail und Passwort aus");
          setLoginLoading(false);
          return false;
        }
        const success = await handleLogin();
        setLoginLoading(false);
        return success;
      } catch (error: any) {
        console.error('Login error:', error);
        if (error.message.includes('rate_limit')) {
          const cooldownTime = Date.now() + 15000;
          setCooldownEndTime(cooldownTime);
          toast.error(`Bitte warten Sie ${getRemainingCooldown()} Sekunden, bevor Sie es erneut versuchen.`);
        } else {
          toast.error(error.message || "Ein unerwarteter Fehler ist aufgetreten");
        }
        setLoginLoading(false);
        return false;
      }
    }
  };

  const setFormData = (data: Partial<FormData> | ((prev: FormData) => FormData)) => {
    if (isSignUp) {
      setRegistrationFormData(data as SetStateAction<RegistrationData>);
    } else {
      setLoginFormData(data as SetStateAction<LoginFormData>);
    }
  };

  return {
    isLoading: isSignUp ? registrationLoading : loginLoading,
    registrationStep,
    formData: isSignUp ? registrationData : loginData,
    handleSubmit,
    handleInputChange: isSignUp ? handleRegistrationInputChange : handleLoginInputChange,
    setFormData,
    cooldownRemaining: getRemainingCooldown(),
    isSignUp,
    setIsSignUp,
    setRegistrationStep,
  };
};