import { Card } from "@/components/ui/card";
import { Template } from "@/types/signature";

interface SignatureTemplateSelectorProps {
  selectedTemplate: Template;
  onSelect: (template: Template) => void;
}

export const SignatureTemplateSelector = ({
  selectedTemplate,
  onSelect,
}: SignatureTemplateSelectorProps) => {
  const templates: { id: Template; name: string; description: string }[] = [
    {
      id: "modern",
      name: "Modern",
      description: "Klares Design mit farbigen Akzenten",
    },
    {
      id: "classic",
      name: "Klassisch",
      description: "Traditionelles Layout mit professioneller Ausstrahlung",
    },
    {
      id: "minimal",
      name: "Minimalistisch",
      description: "Reduziertes Design, fokussiert auf das Wesentliche",
    },
  ];

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Wähle ein Template</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {templates.map((template) => (
          <Card
            key={template.id}
            className={`p-4 cursor-pointer transition-all duration-200 ${
              selectedTemplate === template.id
                ? "ring-2 ring-primary"
                : "hover:bg-muted/50"
            }`}
            onClick={() => onSelect(template.id)}
          >
            <h3 className="font-medium">{template.name}</h3>
            <p className="text-sm text-muted-foreground mt-1">
              {template.description}
            </p>
          </Card>
        ))}
      </div>
    </div>
  );
};