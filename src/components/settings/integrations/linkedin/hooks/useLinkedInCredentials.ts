import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export function useLinkedInCredentials() {
  const [clientId, setClientId] = useState("");
  const [clientSecret, setClientSecret] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Load existing credentials on mount
  useEffect(() => {
    const loadCredentials = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: credentials, error } = await supabase
          .from('platform_auth_status')
          .select('auth_token, refresh_token')
          .eq('user_id', user.id)
          .eq('platform', 'linkedin')
          .single();

        if (error) {
          console.error('Error loading credentials:', error);
          return;
        }

        if (credentials) {
          setClientId(credentials.auth_token || '');
          setClientSecret(credentials.refresh_token || '');
        }
      } catch (error) {
        console.error('Error in loadCredentials:', error);
      }
    };

    loadCredentials();
  }, []);

  return {
    clientId,
    setClientId,
    clientSecret,
    setClientSecret,
    error,
    setError,
    isLoading,
    setIsLoading
  };
}