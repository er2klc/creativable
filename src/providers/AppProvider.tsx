import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SessionContextProvider } from "@supabase/auth-helpers-react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { supabase } from "@/integrations/supabase/client";
import { AuthProvider } from "./AuthProvider";
import { autoProcessEmbeddings, setupEmbeddingsChangeListeners } from "@/lib/auto-embeddings";
import { useEffect } from "react";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 30, // 30 minutes
      gcTime: 1000 * 60 * 60, // 1 hour (früher cacheTime genannt)
      retry: 3,
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
      refetchOnWindowFocus: false
    },
  },
});

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  // Automatische Verarbeitung von Embeddings beim App-Start
  useEffect(() => {
    // Überprüfe, ob der Benutzer angemeldet ist
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          console.log("Benutzer ist angemeldet, starte automatische Verarbeitung von Embeddings");
          // Wenn angemeldet, starte die automatische Verarbeitung
          autoProcessEmbeddings();
          
          // Richte Listener für Datenänderungen ein
          setupEmbeddingsChangeListeners();
        }
      } catch (error) {
        console.error("Fehler beim Überprüfen der Authentifizierung:", error);
      }
    };
    
    checkAuth();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <SessionContextProvider supabaseClient={supabase}>
        <AuthProvider>
          <TooltipProvider>
            <SidebarProvider>
              <Toaster />
              <Sonner />
              {children}
            </SidebarProvider>
          </TooltipProvider>
        </AuthProvider>
      </SessionContextProvider>
    </QueryClientProvider>
  );
};
