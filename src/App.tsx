import { AppProvider } from "@/providers/AppProvider";
import { AppLayout } from "@/components/layout/AppLayout";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Leads from "./pages/Leads";
import Messages from "./pages/Messages";
import Settings from "./pages/Settings";
import LinkedInCallback from "./pages/auth/callback/LinkedIn";
import InstagramCallback from "./pages/auth/callback/Instagram";
import PrivacyPolicy from "./pages/legal/PrivacyPolicy";
import InstagramDataDeletion from "./pages/legal/InstagramDataDeletion";
import { Routes, Route } from "react-router-dom";

const App = () => (
  <AppProvider>
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
  </AppProvider>
);

export default App;