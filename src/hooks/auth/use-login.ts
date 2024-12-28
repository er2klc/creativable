import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface LoginData {
  email: string;
  password: string;
}

export const useLogin = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<LoginData>({
    email: "",
    password: "",
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
        
        // Check if error is invalid credentials
        if (error.message === "Invalid login credentials") {
          const shouldRegister = window.confirm(
            "Diese E-Mail-Adresse ist nicht registriert. Möchten Sie ein Konto erstellen?"
          );
          
          if (shouldRegister) {
            navigate('/auth', { 
              state: { 
                isSignUp: true, 
                initialEmail: formData.email 
              }
            });
          }
          return false;
        }
          
        toast.error("Ungültige Anmeldedaten. Bitte überprüfen Sie Ihre E-Mail und Ihr Passwort.");
        return false;
      }

      if (!data.user) {
        console.error('No user data returned from signin');
        toast.error("Ein unerwarteter Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.");
        return false;
      }
      
      toast.success("Erfolgreich angemeldet! ✨");
      return true;
    } catch (error) {
      console.error('Unexpected error during login:', error);
      toast.error("Ein unerwarteter Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.");
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
  };
};