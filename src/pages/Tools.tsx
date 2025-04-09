
import { Card } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Pencil, Link2, QrCode, Image, MessageSquareText, Wrench } from "lucide-react";
import { SearchBar } from "@/components/dashboard/SearchBar";
import { HeaderActions } from "@/components/layout/HeaderActions";
import { useUser } from "@supabase/auth-helpers-react";

const Tools = () => {
  const user = useUser();
  const tools = [
    {
      title: "Signatur-Ersteller",
      description: "Erstelle und passe deine digitale Signatur an. Wähle aus verschiedenen Schriftarten und Stilen.",
      icon: Pencil, // Changed from Signature to Pencil
      url: "/signature-generator",
      gradient: "from-purple-500 to-pink-500"
    },
    {
      title: "Tree-Generator",
      description: "Erstelle eine personalisierte Seite mit all deinen wichtigen Links für Social Media.",
      icon: Link2,
      url: "/tree-generator",
      gradient: "from-blue-500 to-cyan-500"
    },
    {
      title: "QR-Code-Generator",
      description: "Generiere anpassbare QR-Codes für URLs, Texte, Kontakte oder Wi-Fi-Zugänge.",
      icon: QrCode,
      url: "/tools/qr-code",
      gradient: "from-green-500 to-emerald-500"
    },
    {
      title: "Bio Generator",
      description: "Erstelle eine professionelle Instagram-Bio mit KI-Unterstützung.",
      icon: MessageSquareText,
      url: "/bio-generator",
      gradient: "from-violet-500 to-purple-500"
    },
    {
      title: "VisionBoard",
      description: "Sammle und organisiere deine Ideen, Zitate und Ziele in einem visuellen Board.",
      icon: Image,
      url: "/vision-board",
      gradient: "from-orange-500 to-yellow-500"
    }
  ];

  return (
    <>
      <div className="fixed top-0 left-0 right-0 z-[40] bg-white border-b border-sidebar-border md:left-[72px] md:group-hover:left-[240px] transition-[left] duration-300">
        <div className="w-full">
          <div className="h-16 px-4 flex items-center">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 w-full">
              <div className="flex items-center gap-2">
                <Wrench className="h-5 w-5" />
                <h1 className="text-lg md:text-xl font-semibold text-foreground">
                  Tools
                </h1>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-[300px]">
                  <SearchBar />
                </div>
              </div>
              <HeaderActions profile={null} userEmail={user?.email} />
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto p-6 pt-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {tools.map((tool) => (
            <Link to={tool.url} key={tool.title}>
              <Card className="group relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:scale-105">
                <div className={`absolute inset-0 opacity-10 bg-gradient-to-br ${tool.gradient}`} />
                <div className="relative p-6 space-y-4">
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center bg-gradient-to-br shadow-lg ${tool.gradient}`}>
                    <tool.icon className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{tool.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {tool.description}
                    </p>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
};

export default Tools;
