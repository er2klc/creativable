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
import LinkedInCallback from "./pages/auth/callback/LinkedIn";
import InstagramCallback from "./pages/auth/callback/Instagram";
import PrivacyPolicy from "./pages/legal/PrivacyPolicy";
import InstagramDataDeletion from "./pages/legal/InstagramDataDeletion";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return null;
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
};

const App = () => (
  <AppProvider>
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/auth" element={<Auth />} />
      <Route path="/register" element={<Register />} />
      <Route path="/auth/callback/linkedin" element={<LinkedInCallback />} />
      <Route path="/auth/callback/instagram" element={<InstagramCallback />} />
      <Route path="/privacy-policy" element={<PrivacyPolicy />} />
      <Route path="/auth/data-deletion/instagram" element={<InstagramDataDeletion />} />
      <Route path="/changelog" element={<AppLayout><Changelog /></AppLayout>} />
      
      {/* Protected Routes */}
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <AppLayout><Dashboard /></AppLayout>
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
      <Route path="/elevate/platform/:platformSlug" element={
        <ProtectedRoute>
          <AppLayout><PlatformDetail /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/elevate/platform/:platformSlug" element={
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
  </AppProvider>
);

export default App;