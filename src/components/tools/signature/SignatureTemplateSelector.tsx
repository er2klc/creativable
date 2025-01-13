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
      description: "Zentriertes Design mit farbigen Akzenten",
    },
    {
      id: "classic",
      name: "Professional",
      description: "Zweispaltiges Layout mit eleganter Linie",
    },
    {
      id: "minimal",
      name: "Minimalistisch",
      description: "Schlankes Design mit subtilen Details",
    },
  ];

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Wähle ein Template</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {templates.map((template) => (
          <Card
            key={template.id}
            className={`p-6 cursor-pointer transition-all duration-200 hover:shadow-lg ${
              selectedTemplate === template.id
                ? "ring-2 ring-blue-500 bg-blue-50/10"
                : "hover:bg-gray-50/10"
            }`}
            onClick={() => onSelect(template.id)}
          >
            <h3 className="font-medium text-lg mb-2">{template.name}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {template.description}
            </p>
          </Card>
        ))}
      </div>
    </div>
  );
};