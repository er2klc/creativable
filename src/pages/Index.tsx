import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useSupabaseClient, useUser } from "@supabase/auth-helpers-react";
import { MessageSquare, Users, Calendar, BarChart2, Bot, Globe } from "lucide-react";

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
            Verwalte deine Leads, optimiere dein Follow-up und automatisiere dein Geschäft mit KI-Unterstützung
          </p>
          <div className="flex justify-center gap-4">
            <Button
              onClick={() => navigate("/auth")}
              size="lg"
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg text-lg"
            >
              Jetzt kostenlos testen
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mt-20">
          <FeatureCard
            icon={Users}
            title="Lead-Management"
            description="Verwalte deine Kontakte effizient mit einem übersichtlichen Kanban-Board und detaillierten Profilen."
          />
          <FeatureCard
            icon={Bot}
            title="KI-Unterstützung"
            description="Nutze KI für personalisierte Nachrichten und automatische Lead-Analysen."
          />
          <FeatureCard
            icon={Globe}
            title="Social Media Integration"
            description="Verbinde dich nahtlos mit LinkedIn, Instagram und weiteren Plattformen."
          />
          <FeatureCard
            icon={MessageSquare}
            title="Nachrichtenverwaltung"
            description="Behalte den Überblick über alle Konversationen und nutze Vorlagen für effiziente Kommunikation."
          />
          <FeatureCard
            icon={Calendar}
            title="Aufgabenplanung"
            description="Plane und verfolge alle Follow-ups und Meetings mit dem integrierten Kalender."
          />
          <FeatureCard
            icon={BarChart2}
            title="Analysen & Berichte"
            description="Verfolge deinen Erfolg mit detaillierten Statistiken und Conversion-Tracking."
          />
        </div>

        {/* Benefits Section */}
        <div className="mt-20 text-center">
          <h2 className="text-3xl font-bold mb-12">Warum MLMFlow?</h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <BenefitCard
              title="Zeitersparnis"
              description="Automatisiere wiederkehrende Aufgaben und konzentriere dich auf das Wesentliche."
            />
            <BenefitCard
              title="Höhere Conversion"
              description="Verbessere deine Abschlussquote durch datengestützte Entscheidungen."
            />
            <BenefitCard
              title="Professioneller Auftritt"
              description="Präsentiere dich und dein Business stets von der besten Seite."
            />
            <BenefitCard
              title="Skalierbarkeit"
              description="Wachse effizient und behalte dabei alle Prozesse im Griff."
            />
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-20 text-center bg-blue-50 rounded-xl p-12">
          <h2 className="text-3xl font-bold mb-6">Bereit durchzustarten?</h2>
          <p className="text-xl text-gray-600 mb-8">
            Starte jetzt und erlebe, wie MLMFlow dein Network-Marketing auf das nächste Level hebt.
          </p>
          <Button
            onClick={() => navigate("/auth")}
            size="lg"
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg text-lg"
          >
            Kostenlos registrieren
          </Button>
        </div>
      </div>
    </div>
  );
};

const FeatureCard = ({ icon: Icon, title, description }: { icon: any; title: string; description: string }) => (
  <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
    <div className="flex items-center gap-3 mb-4">
      <Icon className="h-6 w-6 text-blue-600" />
      <h3 className="text-xl font-semibold">{title}</h3>
    </div>
    <p className="text-gray-600">{description}</p>
  </div>
);

const BenefitCard = ({ title, description }: { title: string; description: string }) => (
  <div className="bg-white p-6 rounded-xl shadow-sm">
    <h3 className="text-xl font-semibold mb-3">{title}</h3>
    <p className="text-gray-600">{description}</p>
  </div>
);

export default Index;