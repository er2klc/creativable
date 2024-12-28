import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface LoginFormData {
  name: string;
  email: string;
  password: string;
  phoneNumber: string;
  language: string;
}

export const useLogin = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<LoginFormData>({
    name: "",
    email: "",
    password: "",
    phoneNumber: "",
    language: "Deutsch",
  });

  const handleLogin = async () => {
    console.log('Starting signin process with email:', formData.email);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (error) {
        console.error('Signin error:', error);
        toast.error("Ungültige Anmeldedaten. Bitte überprüfen Sie Ihre E-Mail und Ihr Passwort.");
        return false;
      }

      if (data?.user) {
        toast.success("Erfolgreich angemeldet!");
        navigate("/dashboard");
        return true;
      }

      return false;
    } catch (error) {
      console.error('Signin error:', error);
      toast.error("Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.");
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
    formData,
    handleLogin,
    handleInputChange,
    setFormData,
  };
};