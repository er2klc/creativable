
import { useEffect, useState, useCallback, useRef } from 'react';
import { useSupabaseClient, useSessionContext, User } from '@supabase/auth-helpers-react';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const supabaseClient = useSupabaseClient();
  const { session, isLoading: sessionLoading } = useSessionContext();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const fetchAttemptedRef = useRef(false);

  // Memoize the fetchUser function to prevent recreation on each render
  const fetchUser = useCallback(async () => {
    if (sessionLoading || fetchAttemptedRef.current) return; // Wait for session to be determined
    
    try {
      fetchAttemptedRef.current = true;
      setIsLoading(true);
      
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
  }, [session, sessionLoading]);

  // Reset fetch attempt flag when session changes
  useEffect(() => {
    if (session?.user?.id !== user?.id) {
      fetchAttemptedRef.current = false;
    }
  }, [session?.user?.id, user?.id]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]); // Only depends on the memoized fetchUser function

  return { 
    user, 
    isLoading: isLoading || sessionLoading, 
    error 
  };
};
