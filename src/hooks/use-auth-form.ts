import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { toast } from "sonner";

interface RegistrationStep {
  name: string;
  email: string;
  password: string;
  companyName: string;
}

export const useAuthForm = () => {
  const supabase = useSupabaseClient();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [registrationStep, setRegistrationStep] = useState(1);
  const [formData, setFormData] = useState<RegistrationStep>({
    name: "",
    email: "",
    password: "",
    companyName: "",
  });
  const [isSignUp, setIsSignUp] = useState(false);
  const [lastSubmitTime, setLastSubmitTime] = useState(0);
  const [cooldownEndTime, setCooldownEndTime] = useState(0);

  const handleCompanyInfoFetch = async (userId: string) => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase.functions.invoke('fetch-company-info', {
        body: { 
          companyName: formData.companyName,
          userId: userId,
          isRegistration: true // This indicates we're in the registration process
        }
      });

      if (error) throw error;

      const { error: settingsError } = await supabase
        .from('settings')
        .upsert({
          user_id: userId,
          registration_company_name: formData.companyName,
          registration_completed: true,
          company_name: data.companyName,
          products_services: data.productsServices,
          target_audience: data.targetAudience,
          usp: data.usp,
          business_description: data.businessDescription,
        });

      if (settingsError) throw settingsError;

      toast.success("Registrierung erfolgreich abgeschlossen! ✨");
      navigate("/dashboard");
    } catch (error: any) {
      console.error("Error fetching company info:", error);
      toast.error("Fehler beim Abrufen der Firmeninformationen");
    } finally {
      setIsLoading(false);
    }
  };

  const getRemainingCooldown = () => {
    if (cooldownEndTime === 0) return 0;
    const remaining = Math.ceil((cooldownEndTime - Date.now()) / 1000);
    return remaining > 0 ? remaining : 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const remainingCooldown = getRemainingCooldown();
    if (remainingCooldown > 0) {
      toast.error(`Bitte warten Sie noch ${remainingCooldown} Sekunden, bevor Sie es erneut versuchen.`);
      return;
    }
    
    setIsLoading(true);
    setLastSubmitTime(Date.now());

    try {
      if (isSignUp) {
        if (registrationStep === 1) {
          if (!formData.name || !formData.email || !formData.password) {
            toast.error("Bitte füllen Sie alle Felder aus");
            return;
          }
          setRegistrationStep(2);
        } else {
          if (!formData.companyName) {
            toast.error("Bitte geben Sie Ihren Firmennamen ein");
            return;
          }

          const { data: authData, error } = await supabase.auth.signUp({
            email: formData.email,
            password: formData.password,
            options: {
              data: {
                full_name: formData.name,
              },
            },
          });

          if (error) {
            if (error.message.includes('rate_limit')) {
              const cooldownTime = Date.now() + 15000; // 15 seconds cooldown
              setCooldownEndTime(cooldownTime);
              toast.error(`Bitte warten Sie ${getRemainingCooldown()} Sekunden, bevor Sie es erneut versuchen.`);
            } else {
              throw error;
            }
            return;
          }

          if (authData.user) {
            await handleCompanyInfoFetch(authData.user.id);
          }
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });

        if (error) {
          if (error.message.includes('rate_limit')) {
            const cooldownTime = Date.now() + 15000; // 15 seconds cooldown
            setCooldownEndTime(cooldownTime);
            toast.error(`Bitte warten Sie ${getRemainingCooldown()} Sekunden, bevor Sie es erneut versuchen.`);
          } else {
            throw error;
          }
          return;
        }
        
        toast.success("Erfolgreich angemeldet! ✨");
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
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
    registrationStep,
    formData,
    isSignUp,
    handleSubmit,
    handleInputChange,
    setIsSignUp,
    setRegistrationStep,
    cooldownRemaining: getRemainingCooldown(),
  };
};