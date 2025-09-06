import { AppProvider } from "@/providers/AppProvider";
import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import { ChatButton } from "@/components/dashboard/ChatButton";
import { useChatVisibility } from "@/hooks/use-chat-visibility";
import { publicRoutes } from "@/config/public-routes";
import { protectedRoutes } from "@/config/protected-routes";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { AppLayout } from "@/components/layout/AppLayout";
import { Suspense, lazy, useEffect, useState } from "react";

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
  const publicPaths = publicRoutes.map((route) => route.path);
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
            {publicRoutes.map((route) => (
              <Route
                key={route.path}
                path={route.path}
                element={route.element}
              />
            ))}

            {/* Protected Routes */}
            <Route
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <Outlet />
                  </AppLayout>
                </ProtectedRoute>
              }
            >
              {protectedRoutes.map((route) => (
                <Route
                  key={route.path}
                  path={route.path}
                  element={route.element}
                />
              ))}
            </Route>

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

