import { useState, Dispatch, SetStateAction } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useRegistration, RegistrationData } from "./auth/use-registration";
import { useLogin } from "./auth/use-login";

export interface LoginFormData {
  name: string;
  email: string;
  password: string;
  phoneNumber: string;
  language: string;
}

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
          if (!data.name || !data.email || !data.password || !data.phoneNumber) {
            toast.error("Bitte füllen Sie alle Felder aus");
            setRegistrationLoading(false);
            return false;
          }

          // Validate phone number format
          const phoneRegex = /^\+?[1-9]\d{1,14}$/;
          if (!phoneRegex.test(data.phoneNumber.replace(/\s+/g, ''))) {
            toast.error("Bitte geben Sie eine gültige Telefonnummer ein (z.B. +49 123 45678900)");
            setRegistrationLoading(false);
            return false;
          }

          setRegistrationStep(2);
          setRegistrationLoading(false);
          return true;
        } else {
          if (!data.companyName) {
            toast.error("Bitte geben Sie Ihren Firmennamen ein");
            setRegistrationLoading(false);
            return false;
          }
          return await handleRegistration();
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
        return false;
      } finally {
        setRegistrationLoading(false);
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
        return await handleLogin();
      } catch (error: any) {
        console.error('Login error:', error);
        if (error.message.includes('rate_limit')) {
          const cooldownTime = Date.now() + 15000;
          setCooldownEndTime(cooldownTime);
          toast.error(`Bitte warten Sie ${getRemainingCooldown()} Sekunden, bevor Sie es erneut versuchen.`);
        } else {
          toast.error(error.message || "Ein unerwarteter Fehler ist aufgetreten");
        }
        return false;
      } finally {
        setLoginLoading(false);
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