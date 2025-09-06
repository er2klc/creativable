
import { AuthCard } from "@/components/auth/AuthCard";
import { AuthFormContent } from "@/components/auth/AuthFormContent";
import { useAuth } from "@/hooks/use-auth";
import { useEffect, useTransition } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const Auth = () => {
  const { user, isLoading, error } = useAuth();
  const isAuthenticated = !!user;
  const navigate = useNavigate();
  const location = useLocation();
  const [isPending, startTransition] = useTransition();
  const state = location.state as { sessionExpired?: boolean; returnTo?: string } | null;

  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      startTransition(() => {
        navigate(state?.returnTo || "/dashboard");
      });
    }
  }, [isAuthenticated, isLoading, navigate, state?.returnTo]);

  if (isLoading || isPending) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0A0A0A]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white" />
      </div>
    );
  }

  return (
    <AuthCard
      title={state?.sessionExpired ? "Sitzung abgelaufen" : "Anmeldung"}
      description={
        state?.sessionExpired 
          ? "Ihre Sitzung ist abgelaufen. Bitte melden Sie sich erneut an."
          : "Melden Sie sich in Ihrem Konto an"
      }
    >
      <AuthFormContent />
    </AuthCard>
  );
};

export default Auth;

