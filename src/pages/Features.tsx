import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Brain, Rocket, Globe, MessageSquare, Users, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { MainLayout } from "@/components/layout/MainLayout";

const Features = () => {
  const navigate = useNavigate();

  return (
    <MainLayout>
      <div className="min-h-screen w-full bg-[#0A0A0A] text-white overflow-x-hidden pt-20">
        {/* Hero Section */}
        <div className="relative min-h-[60vh] w-full flex items-center justify-center">
          <div className="absolute inset-0 bg-gradient-to-b from-purple-600/20 via-blue-500/10 to-transparent opacity-30" />
          <div className="container mx-auto px-4 text-center relative z-10">
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-red-500 via-yellow-500 to-blue-500 bg-clip-text text-transparent mb-6">
              Entdecken Sie die Möglichkeiten
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Creativable bietet Ihnen alle Werkzeuge, die Sie für erfolgreiches Social Media Marketing und Leadmanagement benötigen.
            </p>
          </div>
        </div>

        {/* Features Grid */}
        <div className="container mx-auto px-4 py-20">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={Brain}
              title="KI-gestützte Kommunikation"
              description="Nutzen Sie die Kraft der künstlichen Intelligenz für personalisierte und effektive Kundenkommunikation."
              gradient="from-purple-500/20 to-blue-500/20"
            />
            <FeatureCard
              icon={Globe}
              title="Multi-Plattform Integration"
              description="Verwalten Sie alle Ihre Social Media Kanäle zentral und effizient aus einer einzigen Plattform."
              gradient="from-blue-500/20 to-green-500/20"
            />
            <FeatureCard
              icon={MessageSquare}
              title="Automatisierte Nachrichten"
              description="Sparen Sie Zeit durch intelligente Automatisierung Ihrer Kundenkommunikation."
              gradient="from-yellow-500/20 to-red-500/20"
            />
            <FeatureCard
              icon={Users}
              title="Lead Management"
              description="Verfolgen und optimieren Sie Ihre Lead-Generierung mit unserem fortschrittlichen CRM-System."
              gradient="from-red-500/20 to-purple-500/20"
            />
            <FeatureCard
              icon={Rocket}
              title="Performance Analytics"
              description="Detaillierte Einblicke und Analysen für datengesteuerte Entscheidungen."
              gradient="from-green-500/20 to-yellow-500/20"
            />
            <FeatureCard
              icon={Lock}
              title="Sicherheit & Datenschutz"
              description="Höchste Sicherheitsstandards und DSGVO-Konformität für Ihre Daten."
              gradient="from-blue-500/20 to-purple-500/20"
            />
          </div>
        </div>

        {/* Benefits Section */}
        <div className="relative w-full py-20 bg-[#111111]">
          <div className="absolute inset-0 bg-gradient-to-b from-blue-500/10 via-purple-500/10 to-transparent opacity-30" />
          <div className="container mx-auto px-4 relative z-10">
            <h2 className="text-4xl font-bold text-center mb-16">
              Ihre Vorteile mit Creativable
            </h2>
            <div className="grid md:grid-cols-2 gap-12">
              <BenefitItem
                title="Zeitersparnis"
                description="Automatisieren Sie wiederkehrende Aufgaben und fokussieren Sie sich auf das Wesentliche."
              />
              <BenefitItem
                title="Höhere Conversion"
                description="Verbessern Sie Ihre Lead-Konvertierung durch personalisierte Kommunikation."
              />
              <BenefitItem
                title="Skalierbarkeit"
                description="Wachsen Sie ohne Einschränkungen und verwalten Sie beliebig viele Kontakte."
              />
              <BenefitItem
                title="Messbare Ergebnisse"
                description="Verfolgen Sie Ihren Erfolg mit detaillierten Analytics und Reports."
              />
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="relative w-full py-20">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-4xl font-bold mb-8">
              Bereit für den nächsten Schritt?
            </h2>
            <p className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto">
              Starten Sie jetzt mit Creativable und revolutionieren Sie Ihr Social Media Marketing.
            </p>
            <Button
              onClick={() => navigate("/register")}
              size="lg"
              className="bg-[#1A1F2C]/80 hover:bg-[#2A2F3C]/80 text-white border border-white/10 shadow-lg backdrop-blur-sm px-8 py-6 text-lg"
            >
              Kostenlos Testen
            </Button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

const FeatureCard = ({ 
  icon: Icon, 
  title, 
  description, 
  gradient 
}: { 
  icon: any; 
  title: string; 
  description: string; 
  gradient: string;
}) => (
  <div className={cn(
    "group p-8 rounded-xl backdrop-blur-sm transition-all duration-300 hover:scale-105",
    "bg-gradient-to-br border border-white/10",
    gradient
  )}>
    <Icon className="h-12 w-12 mb-6 text-white" />
    <h3 className="text-xl font-semibold mb-4">{title}</h3>
    <p className="text-gray-300">{description}</p>
  </div>
);

const BenefitItem = ({ title, description }: { title: string; description: string }) => (
  <div className="flex gap-4">
    <div className="flex-1">
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-300">{description}</p>
    </div>
  </div>
);

export default Features;