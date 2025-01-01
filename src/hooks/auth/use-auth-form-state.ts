import { useState } from "react";
import { useLocation } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const useAuthFormState = () => {
  const location = useLocation();
  const [isSignUp, setIsSignUp] = useState(false);
  const [registrationStep, setRegistrationStep] = useState(1);

  const handleSocialLogin = async (provider: 'google' | 'apple') => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback/${provider}`,
        },
      });
      
      if (error) throw error;
    } catch (error: any) {
      console.error(`${provider} login error:`, error);
      toast.error(`Fehler beim ${provider}-Login. Bitte versuchen Sie es später erneut.`);
    }
  };

  return {
    isSignUp,
    setIsSignUp,
    registrationStep,
    setRegistrationStep,
    handleSocialLogin,
    location
  };
};