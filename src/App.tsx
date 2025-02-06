import { AppProvider } from "@/providers/AppProvider";
import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import { ChatButton } from "@/components/dashboard/ChatButton";
import { useChatVisibility } from "@/hooks/use-chat-visibility";
import { publicRoutes } from "@/config/public-routes";
import { protectedRoutes } from "@/config/protected-routes";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { AppLayout } from "@/components/layout/AppLayout";

const AppRoutes = () => {
  const { isAuthenticated, isLoading } = useAuth();

  // Get paths for chat visibility
  const publicPaths = publicRoutes.map((route) => route.path);
  const showChat = useChatVisibility(publicPaths);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <Routes>
        {/* Dynamische öffentliche Routen */}
        {publicRoutes.map((route) => (
          <Route key={route.path} path={route.path} element={route.element} />
        ))}

        {/* Dynamische geschützte Routen */}
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
            <Route key={route.path} path={route.path} element={route.element} />
          ))}
        </Route>

        {/* Statische Fallback-Routen (nur für Debugging) */}
        <Route
          path="/contacts"
          element={
            <ProtectedRoute>
              <AppLayout>
                <div>Contacts Page (Fallback)</div>
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/contacts/:id"
          element={
            <ProtectedRoute>
              <AppLayout>
                <div>Contact Detail Page (Fallback)</div>
              </AppLayout>
            </ProtectedRoute>
          }
        />

        {/* Root-Route */}
        <Route
          path="/"
          element={
            <Navigate
              to={isAuthenticated ? "/dashboard" : "/auth"}
              replace
            />
          }
        />

        {/* Catch-all */}
        <Route
          path="*"
          element={
            <Navigate
              to={isAuthenticated ? "/dashboard" : "/auth"}
              replace
            />
          }
        />

        {/* Legacy-Routen */}
        <Route
          path="/leads"
          element={<Navigate to="/contacts" replace />}
        />
        <Route
          path="/leads/:id"
          element={<Navigate to="/contacts/:id" replace />}
        />
      </Routes>

      {/* Chat Button */}
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
