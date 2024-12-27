import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { toast } from "sonner";

interface RegistrationStep {
  name: string;
  email: string;
  password: string;
  companyName: string;
  phoneNumber: string;
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
    phoneNumber: "",
  });
  const [isSignUp, setIsSignUp] = useState(false);
  const [lastSubmitTime, setLastSubmitTime] = useState(0);
  const [cooldownEndTime, setCooldownEndTime] = useState(0);

  const handleCompanyInfoFetch = async (userId: string) => {
    try {
      console.log('Starting company info fetch for user:', userId);
      setIsLoading(true);

      // First create initial settings record
      const { error: settingsError } = await supabase
        .from('settings')
        .insert({
          user_id: userId,
          registration_step: 1,
          language: 'de'
        });

      if (settingsError) {
        console.error('Settings creation error:', settingsError);
        throw new Error('Fehler beim Erstellen der Benutzereinstellungen');
      }

      const { data, error } = await supabase.functions.invoke('fetch-company-info', {
        body: { 
          companyName: formData.companyName,
          userId: userId,
          isRegistration: true
        }
      });

      console.log('Company info fetch response:', { data, error });

      if (error) {
        console.error('Function invocation error:', error);
        throw new Error('Fehler beim Abrufen der Firmeninformationen. Bitte versuchen Sie es später erneut.');
      }

      if (!data) {
        console.error('No data returned from function');
        throw new Error('Keine Firmeninformationen gefunden. Bitte überprüfen Sie den Firmennamen.');
      }

      const { error: updateError } = await supabase
        .from('settings')
        .update({
          registration_company_name: formData.companyName,
          registration_completed: true,
          company_name: data.companyName,
          products_services: data.productsServices,
          target_audience: data.targetAudience,
          usp: data.usp,
          business_description: data.businessDescription,
          whatsapp_number: formData.phoneNumber,
        })
        .eq('user_id', userId);

      if (updateError) {
        console.error('Settings update error:', updateError);
        throw new Error('Fehler beim Speichern der Firmeninformationen');
      }

      toast.success("Registrierung erfolgreich abgeschlossen! ✨");
      navigate("/dashboard");
    } catch (error: any) {
      console.error("Error in handleCompanyInfoFetch:", error);
      toast.error(error.message || "Fehler beim Abrufen der Firmeninformationen");
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
          if (!formData.name || !formData.email || !formData.password || !formData.phoneNumber) {
            toast.error("Bitte füllen Sie alle Felder aus");
            setIsLoading(false);
            return;
          }

          // Validate phone number format
          const phoneRegex = /^\+?[1-9]\d{1,14}$/;
          if (!phoneRegex.test(formData.phoneNumber.replace(/\s+/g, ''))) {
            toast.error("Bitte geben Sie eine gültige Telefonnummer ein (z.B. +49 123 45678900)");
            setIsLoading(false);
            return;
          }

          setRegistrationStep(2);
          setIsLoading(false);
        } else {
          if (!formData.companyName) {
            toast.error("Bitte geben Sie Ihren Firmennamen ein");
            setIsLoading(false);
            return;
          }

          console.log('Starting signup process with email:', formData.email);
          const { data: authData, error } = await supabase.auth.signUp({
            email: formData.email,
            password: formData.password,
            phone: formData.phoneNumber,
            options: {
              data: {
                full_name: formData.name,
                phone: formData.phoneNumber,
              },
            },
          });

          if (error) {
            console.error('Signup error:', error);
            if (error.message.includes('rate_limit')) {
              const cooldownTime = Date.now() + 15000;
              setCooldownEndTime(cooldownTime);
              toast.error(`Bitte warten Sie ${getRemainingCooldown()} Sekunden, bevor Sie es erneut versuchen.`);
            } else if (error.message.includes('already registered')) {
              toast.error("Diese E-Mail-Adresse ist bereits registriert. Bitte melden Sie sich an.");
            } else {
              toast.error(error.message);
            }
            setIsLoading(false);
            return;
          }

          if (authData.user) {
            console.log('User created successfully:', authData.user.id);
            await handleCompanyInfoFetch(authData.user.id);
          } else {
            console.error('No user data returned from signup');
            toast.error("Fehler bei der Registrierung. Bitte versuchen Sie es später erneut.");
            setIsLoading(false);
          }
        }
      } else {
        console.log('Starting signin process with email:', formData.email);
        const { error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });

        if (error) {
          console.error('Signin error:', error);
          if (error.message.includes('rate_limit')) {
            const cooldownTime = Date.now() + 15000;
            setCooldownEndTime(cooldownTime);
            toast.error(`Bitte warten Sie ${getRemainingCooldown()} Sekunden, bevor Sie es erneut versuchen.`);
          } else if (error.message.includes('Invalid login credentials')) {
            toast.error("Ungültige Anmeldedaten. Bitte überprüfen Sie Ihre E-Mail und Ihr Passwort.");
          } else {
            toast.error(error.message);
          }
          setIsLoading(false);
          return;
        }
        
        toast.success("Erfolgreich angemeldet! ✨");
      }
    } catch (error: any) {
      console.error('Unexpected error:', error);
      toast.error("Ein unerwarteter Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.");
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