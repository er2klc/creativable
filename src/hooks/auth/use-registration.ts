import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export interface RegistrationData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export const useRegistration = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [registrationStep, setRegistrationStep] = useState(1);
  const [formData, setFormData] = useState<RegistrationData>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleRegistration = async () => {
    try {
      console.log("Starting basic registration process with email:", formData.email);
      console.log("Registration request details:", {
        email: formData.email,
        hasPassword: !!formData.password
      });
      
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      });

      if (signUpError) {
        console.error('Registration error:', signUpError);
        if (signUpError.message.includes('already registered')) {
          throw new Error("Diese E-Mail-Adresse ist bereits registriert. Bitte verwenden Sie eine andere E-Mail-Adresse.");
        } else {
          console.error('Detailed registration error:', signUpError);
          throw signUpError;
        }
      }

      if (!authData.user) {
        throw new Error("Fehler bei der Registrierung");
      }

      toast.success("Registrierung erfolgreich! Bitte bestätigen Sie Ihre E-Mail-Adresse.");
      return true;
    } catch (error: any) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return {
    isLoading,
    setIsLoading,
    registrationStep,
    setRegistrationStep,
    formData,
    handleRegistration,
    handleInputChange,
    setFormData,
  };
};