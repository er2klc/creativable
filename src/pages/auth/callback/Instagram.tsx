import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const InstagramCallback = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        console.log('Starting Instagram callback handling...');
        
        const params = new URLSearchParams(window.location.search);
        const code = params.get("code");
        const state = params.get("state");
        const error = params.get("error");
        const storedState = localStorage.getItem("instagram_oauth_state");

        console.log('Received params:', { code: code ? 'present' : 'missing', state, error });

        if (error) {
          throw new Error(params.get("error_description") || "Authentication failed");
        }

        if (!code) {
          throw new Error("No code received from Instagram");
        }

        if (state !== storedState) {
          throw new Error("State mismatch. Possible CSRF attack.");
        }

        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          throw new Error("No active session");
        }

        console.log('Calling Instagram auth callback function...');
        
        // Call our Instagram auth callback function
        const response = await fetch("/api/instagram-auth-callback", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ code }),
        });

        console.log('Received response:', response.status);

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to exchange code for access token");
        }

        toast({
          title: "Instagram erfolgreich verbunden",
          description: "Ihre Instagram-Integration wurde erfolgreich eingerichtet.",
        });

        // Clean up the state from localStorage
        localStorage.removeItem("instagram_oauth_state");

        // Redirect back to settings
        navigate("/settings");
      } catch (error) {
        console.error("Instagram auth callback error:", error);
        toast({
          title: "Fehler bei der Instagram-Verbindung",
          description: error.message,
          variant: "destructive",
        });
        navigate("/settings");
      }
    };

    handleCallback();
  }, [navigate, toast]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
    </div>
  );
};

export default InstagramCallback;