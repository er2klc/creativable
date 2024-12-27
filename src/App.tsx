import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { SessionContextProvider, useSession } from "@supabase/auth-helpers-react";
import { AppLayout } from "@/components/layout/AppLayout";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Leads from "./pages/Leads";
import Messages from "./pages/Messages";
import Settings from "./pages/Settings";
import LinkedInCallback from "./pages/auth/callback/LinkedIn";
import InstagramCallback from "./pages/auth/callback/Instagram";
import { supabase } from "@/integrations/supabase/client";
import { SidebarProvider } from "@/components/ui/sidebar";
import { useEffect, useState } from "react";
import PrivacyPolicy from "./pages/legal/PrivacyPolicy";
import InstagramDataDeletion from "./pages/legal/InstagramDataDeletion";
import { toast } from "sonner";

const queryClient = new QueryClient();

const AuthStateHandler = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const session = useSession();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        if (!currentSession) {
          const publicPaths = ["/", "/auth", "/privacy-policy", "/auth/data-deletion/instagram"];
          if (!publicPaths.includes(location.pathname)) {
            console.log("No session found, redirecting to auth page");
            toast.error("Bitte melden Sie sich an, um fortzufahren.");
            navigate("/auth");
          }
        }
      } catch (error) {
        console.error("Error checking session:", error);
        toast.error("Ein Fehler ist aufgetreten. Bitte laden Sie die Seite neu.");
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();
  }, [navigate, location.pathname]);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      console.log("Auth state changed:", event, currentSession?.user?.id);
      
      if (event === "SIGNED_OUT") {
        console.log("User signed out, redirecting to auth page");
        toast.error("Sie wurden abgemeldet. Bitte melden Sie sich erneut an.");
        navigate("/auth");
        return;
      }
      
      if (event === "SIGNED_IN") {
        console.log("User signed in, redirecting to dashboard");
        navigate("/dashboard");
        return;
      }

      // Überprüfen Sie die Session bei jedem Auth-State-Change
      if (!currentSession && !location.pathname.startsWith("/auth")) {
        const publicPaths = ["/", "/privacy-policy", "/auth/data-deletion/instagram"];
        if (!publicPaths.includes(location.pathname)) {
          console.log("Session expired, redirecting to auth page");
          toast.error("Ihre Sitzung ist abgelaufen. Bitte melden Sie sich erneut an.");
          navigate("/auth");
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate, location.pathname]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    );
  }

  return null;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <SessionContextProvider supabaseClient={supabase}>
      <TooltipProvider>
        <SidebarProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AuthStateHandler />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/auth/callback/linkedin" element={<LinkedInCallback />} />
              <Route path="/auth/callback/instagram" element={<InstagramCallback />} />
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
              <Route path="/auth/data-deletion/instagram" element={<InstagramDataDeletion />} />
              <Route path="/dashboard" element={<AppLayout><Dashboard /></AppLayout>} />
              <Route path="/leads" element={<AppLayout><Leads /></AppLayout>} />
              <Route path="/messages" element={<AppLayout><Messages /></AppLayout>} />
              <Route path="/settings" element={<AppLayout><Settings /></AppLayout>} />
            </Routes>
          </BrowserRouter>
        </SidebarProvider>
      </TooltipProvider>
    </SessionContextProvider>
  </QueryClientProvider>
);

export default App;