import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

export const useChatVisibility = (publicRoutes: string[]) => {
  const location = useLocation();
  const [showChat, setShowChat] = useState(false);

  useEffect(() => {
    let mounted = true;

    const handleAuthChange = (event: string, session: any) => {
      if (mounted) {
        const isAuth = !!session;
        // Hide chat on presentation pages and public routes
        const isPresentation = location.pathname.startsWith('/presentation/');
        const shouldShow = isAuth && !publicRoutes.includes(location.pathname) && !isPresentation;
        
        console.log("[App] Auth state changed:", {
          event,
          isAuthenticated: isAuth,
          path: location.pathname,
          shouldShow,
          userId: session?.user?.id,
          timestamp: new Date().toISOString()
        });
        setShowChat(shouldShow);
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange(handleAuthChange);

    // Initial check
    const checkInitialState = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (mounted) {
        const isAuth = !!session;
        const isPresentation = location.pathname.startsWith('/presentation/');
        const shouldShow = isAuth && !publicRoutes.includes(location.pathname) && !isPresentation;
        setShowChat(shouldShow);
      }
    };

    checkInitialState();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [location.pathname, publicRoutes]);

  return showChat;
};