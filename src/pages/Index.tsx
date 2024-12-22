import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useSupabaseClient, useUser } from "@supabase/auth-helpers-react";

const Index = () => {
  const navigate = useNavigate();
  const user = useUser();
  const supabase = useSupabaseClient();

  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            MLMFlow – Die perfekte Plattform für Network-Marketing
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Verwalte deine Leads, optimiere dein Follow-up und automatisiere dein Geschäft
          </p>
          <Button
            onClick={() => navigate("/auth")}
            size="lg"
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg text-lg"
          >
            Jetzt starten
          </Button>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mt-20">
          <FeatureCard
            title="Zentrale Lead-Verwaltung"
            description="Sammle und verwalte Leads aus verschiedenen Social-Media-Plattformen effizient in einer übersichtlichen Datenbank."
          />
          <FeatureCard
            title="KI-Unterstützung"
            description="Automatische Empfehlungen und Workflows speziell für MLM-Profis."
          />
          <FeatureCard
            title="Social-Media-Integration"
            description="Importiere Leads direkt aus Social-Media-Profilen mit wenigen Klicks."
          />
        </div>

        {/* Target Audience Section */}
        <div className="mt-20">
          <h2 className="text-3xl font-bold text-center mb-10">Für wen ist MLMFlow gemacht?</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <AudienceCard
              title="Network-Marketer"
              description="Perfekt für alle, die mehr Effizienz und Struktur in ihre täglichen MLM-Abläufe bringen möchten."
            />
            <AudienceCard
              title="Teamleiter im MLM"
              description="Ideal zur Organisation von Teammitgliedern und Verwaltung potenzieller Kunden."
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const FeatureCard = ({ title, description }: { title: string; description: string }) => (
  <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
    <h3 className="text-xl font-semibold mb-3">{title}</h3>
    <p className="text-gray-600">{description}</p>
  </div>
);

const AudienceCard = ({ title, description }: { title: string; description: string }) => (
  <div className="bg-blue-50 p-6 rounded-xl">
    <h3 className="text-xl font-semibold mb-3">{title}</h3>
    <p className="text-gray-700">{description}</p>
  </div>
);

export default Index;