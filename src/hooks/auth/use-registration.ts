import { useState, Dispatch, SetStateAction } from "react";
import { toast } from "sonner";
import { handleCompanyInfoFetch } from "./utils/company-info";
import { supabase } from "@/integrations/supabase/client";

export interface RegistrationData {
  name: string;
  email: string;
  password: string;
  phoneNumber: string;
  language: string;
  companyName: string;
}

export const useRegistration = () => {
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
    console.log('Starting registration process with email:', formData.email);
    
    const { data: existingUser, error: checkError } = await supabase
      .from('settings')
      .select('user_id')
      .eq('registration_company_name', formData.companyName)
      .single();

    if (existingUser) {
      toast.error("Dieser Firmenname ist bereits registriert");
      return false;
    }

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
      console.error('Registration error:', error);
      if (error.message.includes('already registered')) {
        toast.error("Diese E-Mail-Adresse ist bereits registriert");
      } else {
        toast.error(error.message);
      }
      return false;
    }

    if (authData.user) {
      console.log('User created successfully:', authData.user.id);
      
      // Create initial settings record
      const { error: settingsError } = await supabase
        .from('settings')
        .insert({
          user_id: authData.user.id,
          registration_step: 1,
          language: formData.language,
          registration_company_name: formData.companyName,
          whatsapp_number: formData.phoneNumber,
        });

      if (settingsError) {
        console.error('Settings creation error:', settingsError);
        toast.error("Fehler beim Erstellen der Benutzereinstellungen");
        return false;
      }

      toast.success("Registrierung erfolgreich! Bitte bestätigen Sie Ihre E-Mail-Adresse.");
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