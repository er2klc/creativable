import { AppProvider } from "@/providers/AppProvider";
import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import { ChatButton } from "@/components/dashboard/ChatButton";
import { useChatVisibility } from "@/hooks/use-chat-visibility";
import { publicRoutes } from "@/config/public-routes";
import { protectedRoutes } from "@/config/protected-routes";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { AppLayout } from "@/components/layout/AppLayout";
import { Suspense, lazy } from "react";

// Optimierter LoadingSpinner mit memo
const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen bg-[#0A0A0A]">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white" />
  </div>
);

// Zentrale Suspense-Wrapper-Komponente
const RouteWrapper = ({ children }) => (
  <Suspense fallback={<LoadingSpinner />}>
    {children}
  </Suspense>
);

const AppRoutes = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const publicPaths = publicRoutes.map((route) => route.path);
  const showChat = useChatVisibility(publicPaths);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <>
      <RouteWrapper>
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
      </RouteWrapper>

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

