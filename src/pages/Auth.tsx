import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useSupabaseClient, useUser } from "@supabase/auth-helpers-react";
import { useToast } from "@/components/ui/use-toast";

const AuthPage = () => {
  const supabase = useSupabaseClient();
  const user = useUser();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-sm">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Willkommen bei MLMFlow
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Melde dich an oder erstelle ein neues Konto
          </p>
        </div>
        <Auth
          supabaseClient={supabase}
          appearance={{
            theme: ThemeSupa,
            variables: {
              default: {
                colors: {
                  brand: "#2563eb",
                  brandAccent: "#1d4ed8",
                },
              },
            },
            className: {
              container: "space-y-4",
              button: "w-full",
              input: "rounded-md",
            },
          }}
          providers={[]}
          redirectTo={window.location.origin + "/dashboard"}
          onError={(error) => {
            toast({
              variant: "destructive",
              title: "Fehler bei der Anmeldung",
              description: error.message === "Invalid login credentials" 
                ? "Ungültige Anmeldedaten. Bitte überprüfen Sie Ihre E-Mail und Ihr Passwort."
                : error.message,
            });
          }}
          localization={{
            variables: {
              sign_in: {
                email_label: "E-Mail",
                password_label: "Passwort",
                button_label: "Anmelden",
                loading_button_label: "Anmeldung läuft...",
                email_input_placeholder: "Ihre E-Mail-Adresse",
                password_input_placeholder: "Ihr Passwort",
              },
              sign_up: {
                email_label: "E-Mail",
                password_label: "Passwort",
                button_label: "Registrieren",
                loading_button_label: "Registrierung läuft...",
                email_input_placeholder: "Ihre E-Mail-Adresse",
                password_input_placeholder: "Wählen Sie ein sicheres Passwort",
              },
            },
          }}
        />
      </div>
    </div>
  );
};

export default AuthPage;