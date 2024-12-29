import { Routes, Route } from "react-router-dom";
import { AppProvider } from "@/providers/AppProvider";
import { AppLayout } from "@/components/layout/AppLayout";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { Suspense, lazy } from "react";

const Dashboard = lazy(() => import("@/pages/Dashboard"));
const Unity = lazy(() => import("@/pages/Unity"));
const TeamDetails = lazy(() => import("@/pages/TeamDetails"));
const Login = lazy(() => import("@/pages/auth/Login"));
const Register = lazy(() => import("@/pages/auth/Register"));
const ForgotPassword = lazy(() => import("@/pages/auth/ForgotPassword"));
const ResetPassword = lazy(() => import("@/pages/auth/ResetPassword"));
const InstagramDataDeletion = lazy(() => import("@/pages/auth/InstagramDataDeletion"));

function App() {
  return (
    <AppProvider>
      <Routes>
        <Route element={<AuthLayout />}>
          <Route path="/auth" element={<Login />} />
          <Route path="/auth/register" element={<Register />} />
          <Route path="/auth/forgot-password" element={<ForgotPassword />} />
          <Route path="/auth/reset-password" element={<ResetPassword />} />
          <Route path="/auth/data-deletion/instagram" element={<InstagramDataDeletion />} />
        </Route>

        <Route element={<AppLayout><Outlet /></AppLayout>}>
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={
              <Suspense fallback={<div>Loading...</div>}>
                <Dashboard />
              </Suspense>
            } />
            <Route path="/dashboard" element={
              <Suspense fallback={<div>Loading...</div>}>
                <Dashboard />
              </Suspense>
            } />
            <Route path="/unity" element={
              <Suspense fallback={<div>Loading...</div>}>
                <Unity />
              </Suspense>
            } />
            <Route path="/teams/:teamId" element={
              <Suspense fallback={<div>Loading...</div>}>
                <TeamDetails />
              </Suspense>
            } />
          </Route>
        </Route>
      </Routes>
    </AppProvider>
  );
}

export default App;