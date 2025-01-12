import { AppProvider } from "@/providers/AppProvider";
import { AppLayout } from "@/components/layout/AppLayout";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Unity from "./pages/Unity";
import Elevate from "./pages/Elevate";
import TeamDetail from "./pages/TeamDetail";
import PlatformDetail from "./pages/PlatformDetail";
import Leads from "./pages/Leads";
import Messages from "./pages/Messages";
import Settings from "./pages/Settings";
import Changelog from "./pages/Changelog";
import Calendar from "./pages/Calendar";
import TodoList from "./pages/TodoList";
import LinkedInCallback from "./pages/auth/callback/LinkedIn";
import InstagramCallback from "./pages/auth/callback/Instagram";
import PrivacyPolicy from "./pages/legal/PrivacyPolicy";
import InstagramDataDeletion from "./pages/legal/InstagramDataDeletion";
import News from "./pages/News";
import Support from "./pages/Support";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import { ChatButton } from "@/components/dashboard/ChatButton";
import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const [isSessionChecked, setIsSessionChecked] = useState(false);
  const [hasSession, setHasSession] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const hasValidSession = !!session;
      setHasSession(hasValidSession);
      setIsSessionChecked(true);
      console.log("[Auth] Session check:", { hasSession: hasValidSession, isAuthenticated });
    };
    
    checkSession();
  }, [isAuthenticated]);

  if (isLoading || !isSessionChecked) {
    return null;
  }

  if (!isAuthenticated && !hasSession) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
};

const App = () => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  
  const publicRoutes = ["/", "/auth", "/register", "/privacy-policy", "/auth/data-deletion/instagram", "/news", "/support"];
  const shouldShowChatButton = isAuthenticated && !publicRoutes.includes(location.pathname);

  console.log("[App] Chat button visibility:", { isAuthenticated, path: location.pathname, shouldShow: shouldShowChatButton });

  return (
    <AppProvider>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/register" element={<Register />} />
        <Route path="/news" element={<News />} />
        <Route path="/support" element={<Support />} />
        <Route path="/changelog" element={<AppLayout><Changelog /></AppLayout>} />
        
        {/* Protected Routes */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <AppLayout><Dashboard /></AppLayout>
          </ProtectedRoute>
        } />
        <Route path="/calendar" element={
          <ProtectedRoute>
            <AppLayout><Calendar /></AppLayout>
          </ProtectedRoute>
        } />
        <Route path="/todo" element={
          <ProtectedRoute>
            <AppLayout><TodoList /></AppLayout>
          </ProtectedRoute>
        } />
        <Route path="/unity" element={
          <ProtectedRoute>
            <AppLayout><Unity /></AppLayout>
          </ProtectedRoute>
        } />
        <Route path="/unity/team/:teamSlug" element={
          <ProtectedRoute>
            <AppLayout><TeamDetail /></AppLayout>
          </ProtectedRoute>
        } />
        <Route path="/elevate" element={
          <ProtectedRoute>
            <AppLayout><Elevate /></AppLayout>
          </ProtectedRoute>
        } />
        <Route path="/elevate/modul/:moduleSlug" element={
          <ProtectedRoute>
            <AppLayout><PlatformDetail /></AppLayout>
          </ProtectedRoute>
        } />
        <Route path="/leads" element={
          <ProtectedRoute>
            <AppLayout><Leads /></AppLayout>
          </ProtectedRoute>
        } />
        <Route path="/messages" element={
          <ProtectedRoute>
            <AppLayout><Messages /></AppLayout>
          </ProtectedRoute>
        } />
        <Route path="/settings" element={
          <ProtectedRoute>
            <AppLayout><Settings /></AppLayout>
          </ProtectedRoute>
        } />
      </Routes>
      {shouldShowChatButton && <ChatButton />}
    </AppProvider>
  );
};

export default App;