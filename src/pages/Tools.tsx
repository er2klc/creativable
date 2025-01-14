import { Card } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Signature, Link2, QrCode, Image } from "lucide-react";

const Tools = () => {
  const tools = [
    {
      title: "Signatur-Ersteller",
      description: "Erstelle und passe deine digitale Signatur an. Wähle aus verschiedenen Schriftarten und Stilen.",
      icon: Signature,
      url: "/tools/signature",
      gradient: "from-purple-500 to-pink-500"
    },
    {
      title: "Tree-Generator",
      description: "Erstelle eine personalisierte Seite mit all deinen wichtigen Links für Social Media.",
      icon: Link2,
      url: "/tools/tree",
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
      title: "Inspirationsboard",
      description: "Sammle und organisiere deine Ideen, Zitate und Ziele in einem visuellen Board.",
      icon: Image,
      url: "/tools/inspiration",
      gradient: "from-orange-500 to-yellow-500"
    }
  ];

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Tools</h1>
        <p className="text-muted-foreground mt-2">
          Nutze unsere Tools, um dein Business zu optimieren und professioneller zu gestalten.
        </p>
      </div>

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
  );
};

export default Tools;