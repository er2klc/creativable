import { AppProvider } from "@/providers/AppProvider";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import { ChatButton } from "@/components/dashboard/ChatButton";
import { useChatVisibility } from "@/hooks/use-chat-visibility";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { AppLayout } from "@/components/layout/AppLayout";
import { Suspense, lazy, useEffect, useState } from "react";

// Lazy loaded components
const Index = lazy(() => import("@/pages/Index"));
const Auth = lazy(() => import("@/pages/Auth"));
const Register = lazy(() => import("@/pages/Register"));
const PrivacyPolicy = lazy(() => import("@/pages/legal/PrivacyPolicy"));
const InstagramDataDeletion = lazy(() => import("@/pages/legal/InstagramDataDeletion"));
const PresentationPage = lazy(() => import("@/pages/presentation/[pageId]"));
const Dashboard = lazy(() => import("@/pages/Dashboard"));
const Leads = lazy(() => import("@/pages/Leads"));
const LeadDetail = lazy(() => import("@/pages/LeadDetail"));
const Messages = lazy(() => import("@/pages/Messages"));
const Calendar = lazy(() => import("@/pages/Calendar"));
const Settings = lazy(() => import("@/pages/Settings"));
const Pool = lazy(() => import("@/pages/Pool"));
const Admin = lazy(() => import("@/pages/Admin"));
const Links = lazy(() => import("@/pages/Links"));
const Tools = lazy(() => import("@/pages/Tools"));
const SignatureGenerator = lazy(() => import("@/pages/SignatureGenerator"));
const BioGenerator = lazy(() => import("@/pages/BioGenerator"));
const TreeGenerator = lazy(() => import("@/pages/TreeGenerator"));
const TodoList = lazy(() => import("@/pages/TodoList"));
const VisionBoard = lazy(() => import("@/pages/VisionBoard"));
const Unity = lazy(() => import("@/pages/Unity"));
const Elevate = lazy(() => import("@/pages/Elevate"));
const TeamDetail = lazy(() => import("@/pages/TeamDetail"));

// Einfacher LoadingSpinner ohne memo
const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen bg-[#0A0A0A]">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white" />
  </div>
);

// Error Boundary für Suspense Fehler
const ErrorDisplay = () => (
  <div className="flex flex-col items-center justify-center min-h-screen bg-[#0A0A0A] text-white p-4">
    <h1 className="text-xl font-bold mb-2">Etwas ist schiefgelaufen</h1>
    <p className="mb-4">Bitte versuchen Sie, die Seite neu zu laden.</p>
    <button 
      onClick={() => window.location.reload()}
      className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700"
    >
      Seite neu laden
    </button>
  </div>
);

// ErrorBoundary Komponente
const ErrorBoundary = ({ children }: { children: React.ReactNode }) => {
  const [hasError, setHasError] = useState(false);
  
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      console.error("Global error caught:", event);
      // Verwende requestAnimationFrame, um setState außerhalb des Render-Zyklus auszuführen
      requestAnimationFrame(() => {
        setHasError(true);
      });
    };
    
    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);
  
  if (hasError) return <ErrorDisplay />;
  return children;
};

const AppRoutes = () => {
  const { user, isLoading } = useAuth();
  const isAuthenticated = !!user;
  const publicPaths = ["/", "/auth", "/register", "/privacy-policy", "/auth/data-deletion/instagram"];
  const showChat = useChatVisibility(publicPaths);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <>
      <ErrorBoundary>
        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/register" element={<Register />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/auth/data-deletion/instagram" element={<InstagramDataDeletion />} />
            <Route path="/presentation/:leadId/:pageId" element={<PresentationPage />} />

            {/* Protected Routes */}
            <Route path="/dashboard" element={<ProtectedRoute><AppLayout><Dashboard /></AppLayout></ProtectedRoute>} />
            <Route path="/contacts" element={<ProtectedRoute><AppLayout><Leads /></AppLayout></ProtectedRoute>} />
            <Route path="/contacts/:leadId" element={<ProtectedRoute><AppLayout><LeadDetail /></AppLayout></ProtectedRoute>} />
            <Route path="/pool" element={<ProtectedRoute><AppLayout><Pool /></AppLayout></ProtectedRoute>} />
            <Route path="/pool/:status" element={<ProtectedRoute><AppLayout><Pool /></AppLayout></ProtectedRoute>} />
            <Route path="/messages" element={<ProtectedRoute><AppLayout><Messages /></AppLayout></ProtectedRoute>} />
            <Route path="/calendar" element={<ProtectedRoute><AppLayout><Calendar /></AppLayout></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><AppLayout><Settings /></AppLayout></ProtectedRoute>} />
            <Route path="/admin" element={<ProtectedRoute><AppLayout><Admin /></AppLayout></ProtectedRoute>} />
            <Route path="/links" element={<ProtectedRoute><AppLayout><Links /></AppLayout></ProtectedRoute>} />
            
            {/* Tool Routes */}
            <Route path="/tools" element={<ProtectedRoute><AppLayout><Tools /></AppLayout></ProtectedRoute>} />
            <Route path="/signature-generator" element={<ProtectedRoute><AppLayout><SignatureGenerator /></AppLayout></ProtectedRoute>} />
            <Route path="/bio-generator" element={<ProtectedRoute><AppLayout><BioGenerator /></AppLayout></ProtectedRoute>} />
            <Route path="/tree-generator" element={<ProtectedRoute><AppLayout><TreeGenerator /></AppLayout></ProtectedRoute>} />
            <Route path="/todo" element={<ProtectedRoute><AppLayout><TodoList /></AppLayout></ProtectedRoute>} />
            <Route path="/vision-board" element={<ProtectedRoute><AppLayout><VisionBoard /></AppLayout></ProtectedRoute>} />
            
            {/* Platform Routes */}
            <Route path="/unity" element={<ProtectedRoute><AppLayout><Unity /></AppLayout></ProtectedRoute>} />
            <Route path="/elevate" element={<ProtectedRoute><AppLayout><Elevate /></AppLayout></ProtectedRoute>} />
            <Route path="/unity/:teamSlug" element={<ProtectedRoute><AppLayout><TeamDetail /></AppLayout></ProtectedRoute>} />
            <Route path="/unity/:teamSlug/members" element={<ProtectedRoute><AppLayout><TeamDetail /></AppLayout></ProtectedRoute>} />
            <Route path="/unity/:teamSlug/posts" element={<ProtectedRoute><AppLayout><TeamDetail /></AppLayout></ProtectedRoute>} />
            <Route path="/unity/:teamSlug/calendar" element={<ProtectedRoute><AppLayout><TeamDetail /></AppLayout></ProtectedRoute>} />
            <Route path="/unity/:teamSlug/leaderboard" element={<ProtectedRoute><AppLayout><TeamDetail /></AppLayout></ProtectedRoute>} />
            <Route path="/unity/:teamSlug/pulse" element={<ProtectedRoute><AppLayout><TeamDetail /></AppLayout></ProtectedRoute>} />
            <Route path="/unity/:teamSlug/manage" element={<ProtectedRoute><AppLayout><TeamDetail /></AppLayout></ProtectedRoute>} />

            {/* Catch-all Route */}
            <Route
              path="*"
              element={
                <Navigate
                  to={isAuthenticated ? "/dashboard" : "/"}
                  replace
                />
              }
            />
          </Routes>
        </Suspense>
      </ErrorBoundary>

      {showChat && <ChatButton />}
    </>
  );
};

const App = () => {
  return (
    <AppProvider>
      <AppRoutes />
    </AppProvider>
  );
};

export default App;

