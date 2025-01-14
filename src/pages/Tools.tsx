import { Card } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { FileSignature, MessageSquareText, TreePine } from "lucide-react";

const Tools = () => {
  const tools = [
    {
      title: "E-Mail Signatur",
      description: "Erstelle eine professionelle E-Mail-Signatur.",
      icon: FileSignature,
      url: "/tools/signature",
      gradient: "from-blue-500 to-cyan-500"
    },
    {
      title: "Bio Generator",
      description: "Erstelle eine professionelle Instagram-Bio mit KI-Unterstützung.",
      icon: MessageSquareText,
      url: "/tools/bio",
      gradient: "from-violet-500 to-purple-500"
    },
    {
      title: "Inspirationsboard",
      description: "Erstelle ein digitales Inspirationsboard.",
      icon: TreePine,
      url: "/tools/tree",
      gradient: "from-yellow-500 to-orange-500"
    }
  ];

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Tools</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tools.map((tool) => (
          <Link key={tool.url} to={tool.url}>
            <Card className={`p-6 bg-gradient-to-br ${tool.gradient} hover:scale-105 transition-transform duration-200 text-white`}>
              <div className="flex items-center gap-4">
                <tool.icon className="h-8 w-8" />
                <div>
                  <h3 className="font-semibold text-lg">{tool.title}</h3>
                  <p className="text-sm opacity-90">{tool.description}</p>
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