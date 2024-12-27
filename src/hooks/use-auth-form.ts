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

  const handleCompanyInfoFetch = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase.functions.invoke('fetch-company-info', {
        body: { companyName: formData.companyName }
      });

      if (error) throw error;

      const { error: settingsError } = await supabase
        .from('settings')
        .upsert({
          user_id: supabase.auth.getUser().then(response => response.data.user?.id),
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check rate limiting
    const now = Date.now();
    if (now - lastSubmitTime < 15000) { // 15 seconds cooldown
      toast.error("Bitte warten Sie 15 Sekunden, bevor Sie es erneut versuchen.");
      return;
    }
    
    setIsLoading(true);
    setLastSubmitTime(now);

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

          const { error } = await supabase.auth.signUp({
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
              toast.error("Bitte warten Sie einen Moment, bevor Sie es erneut versuchen.");
            } else {
              throw error;
            }
            return;
          }

          await handleCompanyInfoFetch();
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });

        if (error) {
          if (error.message.includes('rate_limit')) {
            toast.error("Bitte warten Sie einen Moment, bevor Sie es erneut versuchen.");
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
  };
};