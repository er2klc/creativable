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
  const { isAuthenticated } = useAuth();
  const publicPaths = publicRoutes.map(route => route.path);
  const showChat = useChatVisibility(publicPaths);
  
  return (
    <>
      <Routes>
        {/* Public Routes */}
        {publicRoutes.map(route => (
          <Route key={route.path} path={route.path} element={route.element} />
        ))}
        
        {/* Protected Routes */}
        <Route element={
          <ProtectedRoute>
            <AppLayout>
              <Outlet />
            </AppLayout>
          </ProtectedRoute>
        }>
          {protectedRoutes.map(route => (
            <Route 
              key={route.path} 
              path={route.path} 
              element={route.element}
            />
          ))}
        </Route>

        {/* Root route */}
        <Route 
          path="/" 
          element={<Navigate to={isAuthenticated ? "/dashboard" : "/auth"} replace />} 
        />

        {/* Catch all route */}
        <Route 
          path="*" 
          element={<Navigate to={isAuthenticated ? "/dashboard" : "/auth"} replace />} 
        />

        {/* Legacy route redirects */}
        <Route 
          path="/leads" 
          element={<Navigate to="/contacts" replace />} 
        />
        <Route 
          path="/leads/:id" 
          element={<Navigate to="/contacts/:id" replace />} 
        />
        <Route 
          path="/pool" 
          element={<Navigate to="/contacts" replace />} 
        />
      </Routes>
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