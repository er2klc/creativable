import { AuthCard } from "@/components/auth/AuthCard";
import { AuthFormContent } from "@/components/auth/AuthFormContent";
import { useAuth } from "@/hooks/use-auth";
import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const Auth = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as { sessionExpired?: boolean; returnTo?: string } | null;

  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      navigate(state?.returnTo || "/dashboard");
    }
  }, [isAuthenticated, isLoading, navigate, state?.returnTo]);

  if (isLoading) {
    return null;
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