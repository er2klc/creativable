
import { useEffect, useState } from 'react';
import { useSupabaseClient, useSessionContext } from '@supabase/auth-helpers-react';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const supabaseClient = useSupabaseClient();
  const { session } = useSessionContext();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      setIsLoading(true);
      try {
        if (session?.user) {
          setUser(session.user);
        } else {
          // Wenn keine Session vorhanden ist, setzen wir den User auf null
          setUser(null);
        }
      } catch (err: any) {
        setError(err);
        console.error("Auth error:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, [session, supabaseClient]);

  return { user, isLoading, error };
};
