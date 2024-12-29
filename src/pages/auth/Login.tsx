import { AuthCard } from "@/components/auth/AuthCard";
import { AuthFormContent } from "@/components/auth/AuthFormContent";

const Login = () => {
  return (
    <AuthCard
      title="Anmeldung"
      description="Melden Sie sich in Ihrem Konto an"
    >
      <AuthFormContent />
    </AuthCard>
  );
};

export default Login;