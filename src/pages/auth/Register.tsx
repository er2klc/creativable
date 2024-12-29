import { AuthCard } from "@/components/auth/AuthCard";
import { AuthFormContent } from "@/components/auth/AuthFormContent";

const Register = () => {
  return (
    <AuthCard
      title="Registrierung"
      description="Erstellen Sie Ihr Konto"
    >
      <AuthFormContent />
    </AuthCard>
  );
};

export default Register;