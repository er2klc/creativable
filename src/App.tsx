import { AppProvider } from "@/providers/AppProvider";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import { ChatButton } from "@/components/dashboard/ChatButton";
import { useChatVisibility } from "@/hooks/use-chat-visibility";
import { publicRoutes } from "@/config/public-routes";
import { protectedRoutes } from "@/config/protected-routes";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { AppLayout } from "@/components/layout/AppLayout";

const App = () => {
  const { isAuthenticated } = useAuth();
  const publicPaths = publicRoutes.map(route => route.path);
  const showChat = useChatVisibility(publicPaths);
  
  return (
    <AppProvider>
      <Routes>
        {/* Public Routes */}
        {publicRoutes.map(route => (
          <Route key={route.path} path={route.path} element={route.element} />
        ))}
        
        {/* Protected Routes */}
        <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
          {protectedRoutes.map(route => (
            <Route 
              key={route.path} 
              path={route.path} 
              element={route.element}
            />
          ))}
        </Route>

        {/* Catch all route - redirect to dashboard if authenticated, otherwise to auth */}
        <Route path="*" element={
          isAuthenticated ? 
            <Navigate to="/dashboard" replace /> : 
            <Navigate to="/auth" replace />
        } />
      </Routes>
      {showChat && <ChatButton />}
    </AppProvider>
  );
};

export default App;