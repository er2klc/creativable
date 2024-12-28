import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export interface LoginFormData {
  email: string;
  password: string;
}

export const useLogin = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<LoginFormData>({
    email: "",
    password: "",
  });

  const handleLogin = async () => {
    console.log("Starting signin process with email:", formData.email);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (error) {
        console.error("Signin error:", error);
        throw error;
      }

      if (data?.user) {
        navigate("/dashboard");
        return true;
      }

      return false;
    } catch (error: any) {
      console.error("Signin error:", error);
      if (error.message.includes("Invalid login credentials")) {
        toast.error("Ungültige Anmeldedaten. Bitte überprüfen Sie Ihre E-Mail und Ihr Passwort.");
      } else {
        toast.error(error.message || "Ein Fehler ist aufgetreten");
      }
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