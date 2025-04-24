import { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { useSupabaseClient, useSessionContext, User } from '@supabase/auth-helpers-react';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const supabaseClient = useSupabaseClient();
  const { session, isLoading: sessionLoading } = useSessionContext();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const fetchAttemptedRef = useRef(false);
  const sessionIdRef = useRef<string | null>(null);

  // Optimierte Fetch-Funktion
  const fetchUser = useCallback(async () => {
    // Sofortiges Return wenn Session noch lädt
    if (sessionLoading) {
      return;
    }
    
    // Session-ID-Optimierung
    const currentSessionId = session?.user?.id || null;
    if (currentSessionId === sessionIdRef.current && fetchAttemptedRef.current) {
      setIsLoading(false); // Stellen Sie sicher, dass isLoading false ist
      return;
    }
    
    sessionIdRef.current = currentSessionId;
    
    try {
      fetchAttemptedRef.current = true;
      
      if (session?.user) {
        setUser(session.user);
      } else {
        setUser(null);
      }
    } catch (err: any) {
      setError(err);
      console.error("Auth error:", err);
    } finally {
      setIsLoading(false);
    }
  }, [session, sessionLoading]);

  // Optimiere die Abhängigkeiten des useEffect
  useEffect(() => {
    if (!sessionLoading) {
      fetchUser();
    }
  }, [fetchUser, sessionLoading]);

  // Verwende useMemo für das Rückgabeobjekt
  return useMemo(() => ({ 
    user, 
    isLoading: isLoading || sessionLoading, 
    error,
    isAuthenticated: !!user
  }), [user, isLoading, sessionLoading, error]);
};
