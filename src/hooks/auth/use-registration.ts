import { useState, Dispatch, SetStateAction } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { handleCompanyInfoFetch } from "./utils/company-info";
import { useSupabaseClient } from "@supabase/auth-helpers-react";

export interface RegistrationData {
  name: string;
  email: string;
  password: string;
  phoneNumber: string;
  language: string;
  companyName: string;
}

export const useRegistration = () => {
  const supabase = useSupabaseClient();
  const [isLoading, setIsLoading] = useState(false);
  const [registrationStep, setRegistrationStep] = useState(1);
  const [formData, setFormData] = useState<RegistrationData>({
    name: "",
    email: "",
    password: "",
    phoneNumber: "",
    language: "Deutsch",
    companyName: "",
  });

  const handleRegistration = async () => {
    if (!formData.companyName) {
      toast.error("Bitte geben Sie Ihren Firmennamen ein");
      return false;
    }

    console.log('Starting signup process with email:', formData.email);
    const { data: authData, error } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        data: {
          full_name: formData.name,
          phone: formData.phoneNumber,
        },
      },
    });

    if (error) {
      console.error('Signup error:', error);
      if (error.message.includes('already registered')) {
        toast.error("Diese E-Mail-Adresse ist bereits registriert. Bitte melden Sie sich an.");
      } else {
        toast.error(error.message);
      }
      return false;
    }

    if (authData.user) {
      console.log('User created successfully:', authData.user.id);
      await handleCompanyInfoFetch(authData.user.id, formData, supabase);
      return true;
    } else {
      console.error('No user data returned from signup');
      toast.error("Fehler bei der Registrierung. Bitte versuchen Sie es später erneut.");
      return false;
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