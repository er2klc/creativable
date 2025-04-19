import { useEffect, useState, useCallback, useRef } from 'react';
import { useSupabaseClient, useSessionContext, User } from '@supabase/auth-helpers-react';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const supabaseClient = useSupabaseClient();
  const { session, isLoading: sessionLoading } = useSessionContext();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const fetchAttemptedRef = useRef(false);
  const sessionIdRef = useRef<string | null>(null);

  // Memoize the fetchUser function to prevent recreation on each render
  const fetchUser = useCallback(async () => {
    // Skip if still loading session or if we've already fetched for this session
    if (sessionLoading) return;
    
    // If session ID hasn't changed and we've already attempted to fetch, skip
    const currentSessionId = session?.user?.id || null;
    if (currentSessionId === sessionIdRef.current && fetchAttemptedRef.current) {
      return;
    }
    
    // Update session ID reference
    sessionIdRef.current = currentSessionId;
    
    try {
      fetchAttemptedRef.current = true;
      setIsLoading(true);
      
      if (session?.user) {
        setUser(session.user);
      } else {
        // If no session is present, set user to null
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
    if (session?.user?.id !== sessionIdRef.current) {
      fetchAttemptedRef.current = false;
    }
  }, [session?.user?.id]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]); // Only depends on the memoized fetchUser function

  return { 
    user, 
    isLoading: isLoading || sessionLoading, 
    error,
    isAuthenticated: !!user
  };
};
