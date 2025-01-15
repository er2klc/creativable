import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { 
  Wand2,
  Signature,
  TreePine,
  FileText,
  ImageIcon
} from "lucide-react";

const Tools = () => {
  const navigate = useNavigate();

  const tools = [
    {
      title: "Signatur Generator",
      description: "Erstellen Sie professionelle E-Mail-Signaturen",
      icon: <Signature className="w-8 h-8" />,
      path: "/signature-generator"
    },
    {
      title: "Tree Generator",
      description: "Erstellen Sie Ihre eigene Link-Landingpage",
      icon: <TreePine className="w-8 h-8" />,
      path: "/tree-generator"
    },
    {
      title: "Bio Generator",
      description: "Generieren Sie optimierte Social Media Bios",
      icon: <FileText className="w-8 h-8" />,
      path: "/bio-generator"
    },
    {
      title: "Vision Board",
      description: "Visualisieren Sie Ihre Ziele",
      icon: <ImageIcon className="w-8 h-8" />,
      path: "/vision-board"
    }
  ];

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Tools</h1>
        <p className="text-muted-foreground mt-2">
          Nutzen Sie unsere Tools, um Ihre Arbeit zu optimieren
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tools.map((tool) => (
          <Card
            key={tool.path}
            className="p-6 hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => navigate(tool.path)}
          >
            <div className="flex items-center gap-4">
              <div className="p-2 bg-primary/10 rounded-lg text-primary">
                {tool.icon}
              </div>
              <div>
                <h3 className="font-semibold text-lg">{tool.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {tool.description}
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Tools;