import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { SessionContextProvider, useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
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
import { useEffect } from "react";
import PrivacyPolicy from "./pages/legal/PrivacyPolicy";
import InstagramDataDeletion from "./pages/legal/InstagramDataDeletion";
import { toast } from "sonner";

const queryClient = new QueryClient();

const AuthStateHandler = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const session = useSession();
  const supabase = useSupabaseClient();

  useEffect(() => {
    let previousPath = location.pathname;

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, currentSession) => {
      if (event === "SIGNED_OUT" || event === "TOKEN_REFRESHED" && !currentSession) {
        toast.error("Bitte melden Sie sich erneut an, Ihre Sitzung ist abgelaufen.");
        navigate("/auth", { state: { returnTo: previousPath } });
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate, supabase.auth]);

  useEffect(() => {
    const publicPaths = ["/", "/auth", "/privacy-policy", "/auth/data-deletion/instagram"];
    const currentPath = location.pathname;
    
    if (!session && !publicPaths.includes(currentPath)) {
      toast.error("Bitte melden Sie sich an, um fortzufahren.");
      navigate("/auth", { state: { returnTo: currentPath } });
    }

    // If user is logged in and on auth page, redirect to intended destination or dashboard
    if (session && currentPath === "/auth") {
      const returnTo = location.state?.returnTo || "/dashboard";
      navigate(returnTo);
    }
  }, [session, navigate, location]);

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
              <Route
                path="/dashboard"
                element={
                  <AppLayout>
                    <Dashboard />
                  </AppLayout>
                }
              />
              <Route
                path="/leads"
                element={
                  <AppLayout>
                    <Leads />
                  </AppLayout>
                }
              />
              <Route
                path="/messages"
                element={
                  <AppLayout>
                    <Messages />
                  </AppLayout>
                }
              />
              <Route
                path="/settings"
                element={
                  <AppLayout>
                    <Settings />
                  </AppLayout>
                }
              />
            </Routes>
          </BrowserRouter>
        </SidebarProvider>
      </TooltipProvider>
    </SessionContextProvider>
  </QueryClientProvider>
);

export default App;