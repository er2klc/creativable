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
        const params = new URLSearchParams(window.location.search);
        const code = params.get("code");
        const state = params.get("state");
        const error = params.get("error");
        const storedState = localStorage.getItem("instagram_oauth_state");

        if (error) {
          throw new Error(params.get("error_description") || "Authentication failed");
        }

        if (!code) {
          throw new Error("No code received from Instagram");
        }

        if (state !== storedState) {
          throw new Error("State mismatch. Possible CSRF attack.");
        }

        // Call our Instagram auth callback function
        const response = await fetch("/api/instagram-auth-callback", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ code }),
        });

        if (!response.ok) {
          throw new Error("Failed to exchange code for access token");
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