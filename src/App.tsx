import { AppProvider } from "@/providers/AppProvider";
import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import { ChatButton } from "@/components/dashboard/ChatButton";
import { useChatVisibility } from "@/hooks/use-chat-visibility";
import { publicRoutes } from "@/config/public-routes";
import { protectedRoutes } from "@/config/protected-routes";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { AppLayout } from "@/components/layout/AppLayout";
import { Suspense, lazy, memo } from "react";

// Optimierter LoadingSpinner mit memo
const LoadingSpinner = memo(() => (
  <div className="flex items-center justify-center min-h-screen bg-[#0A0A0A]">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white" />
  </div>
));

// Optimierte Suspense-Wrapper-Komponente mit memo
const RouteWrapper = memo(({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={<LoadingSpinner />}>
    {children}
  </Suspense>
));

// Memoized Public Routes
const PublicRoutesElement = memo(() => (
  <>
    {publicRoutes.map((route) => (
      <Route
        key={route.path}
        path={route.path}
        element={route.element}
      />
    ))}
  </>
));

// Memoized Protected Routes
const ProtectedRoutesElement = memo(() => (
  <>
    {protectedRoutes.map((route) => (
      <Route
        key={route.path}
        path={route.path}
        element={route.element}
      />
    ))}
  </>
));

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
      <RouteWrapper>
        <Routes>
          {/* Public Routes */}
          <PublicRoutesElement />

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
            <ProtectedRoutesElement />
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

// Optimieren der App-Komponente
const App = memo(() => {
  return (
    <AppProvider>
      <AppRoutes />
    </AppProvider>
  );
});

export default App;

