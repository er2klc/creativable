import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useRegistration } from "./auth/use-registration";
import { useLogin } from "./auth/use-login";

export interface RegistrationFormData {
  name: string;
  email: string;
  password: string;
  companyName: string;
  phoneNumber: string;
}

export interface LoginFormData {
  email: string;
  password: string;
}

export const useAuthForm = () => {
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(false);
  const [lastSubmitTime, setLastSubmitTime] = useState(0);
  const [cooldownEndTime, setCooldownEndTime] = useState(0);

  const {
    isLoading: registrationLoading,
    setIsLoading: setRegistrationLoading,
    registrationStep,
    setRegistrationStep,
    formData: registrationData,
    handleRegistration,
    handleInputChange: handleRegistrationInputChange,
  } = useRegistration();

  const {
    isLoading: loginLoading,
    setIsLoading: setLoginLoading,
    formData: loginData,
    handleLogin,
    handleInputChange: handleLoginInputChange,
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
        if (registrationStep === 1) {
          if (!registrationData.name || !registrationData.email || !registrationData.password || !registrationData.phoneNumber) {
            toast.error("Bitte füllen Sie alle Felder aus");
            setRegistrationLoading(false);
            return false;
          }

          // Validate phone number format
          const phoneRegex = /^\+?[1-9]\d{1,14}$/;
          if (!phoneRegex.test(registrationData.phoneNumber.replace(/\s+/g, ''))) {
            toast.error("Bitte geben Sie eine gültige Telefonnummer ein (z.B. +49 123 45678900)");
            setRegistrationLoading(false);
            return false;
          }

          setRegistrationStep(2);
          setRegistrationLoading(false);
          return true;
        } else {
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

  return {
    isLoading: isSignUp ? registrationLoading : loginLoading,
    registrationStep,
    formData: isSignUp ? registrationData : loginData,
    isSignUp,
    handleSubmit,
    handleInputChange: isSignUp ? handleRegistrationInputChange : handleLoginInputChange,
    setIsSignUp,
    setRegistrationStep,
    cooldownRemaining: getRemainingCooldown(),
  };
};