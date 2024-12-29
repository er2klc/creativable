import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
      <div className="max-w-3xl text-center space-y-6">
        <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
          Willkommen bei Lovable
        </h1>
        <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
          Ihre Plattform für effizientes Lead Management und Kommunikation
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            size="lg"
            onClick={() => navigate("/auth")}
          >
            Jetzt Anmelden
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={() => navigate("/auth/register")}
          >
            Registrieren
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;