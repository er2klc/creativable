
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SessionContextProvider } from "@supabase/auth-helpers-react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { supabase } from "@/integrations/supabase/client";
import { AuthProvider } from "./AuthProvider";
import { useEffect } from "react";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 30, // 30 minutes
      gcTime: 1000 * 60 * 60, // 1 hour
      retry: 2,
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
      refetchOnWindowFocus: false
    },
  },
});

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  // Handle global errors
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      // Suppress the subscription error that's coming from React
      if (event.message?.includes('subscribe multiple times')) {
        event.preventDefault();
        return;
      }
      console.error('Global error:', event);
    };

    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
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
