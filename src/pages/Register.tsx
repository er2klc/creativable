import { AuthCard } from "@/components/auth/AuthCard";
import { AuthFormContent } from "@/components/auth/AuthFormContent";
import { useAuth } from "@/hooks/use-auth";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Register = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, isLoading, navigate]);

  if (isLoading) {
    return null;
  }

  return (
    <AuthCard
      title="Registrierung"
      description="Erstellen Sie Ihr kostenloses Konto"
    >
      <AuthFormContent />
    </AuthCard>
  );
};

export default Register;