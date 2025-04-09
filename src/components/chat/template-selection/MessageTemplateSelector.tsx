
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface MessageTemplateSelectorProps {
  templateList: {
    id: string;
    name: string;
    content: string;
    created_at: string;
    updated_at: string;
    user_id: string;
  }[];
  onSelect: (template: any) => void;
  onBack: () => void;
}

export const MessageTemplateSelector = ({ 
  templateList, 
  onSelect, 
  onBack 
}: MessageTemplateSelectorProps) => {
  return (
    <div className="flex flex-col h-full">
      <div className="p-3 border-b flex items-center">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back
        </Button>
        <h3 className="text-sm font-medium ml-2">Select a template</h3>
      </div>
      
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {templateList.length === 0 ? (
          <p className="text-center text-muted-foreground p-4">
            No templates available.
          </p>
        ) : (
          templateList.map((template) => (
            <Card
              key={template.id}
              className="p-3 cursor-pointer hover:bg-accent/50 transition-colors"
              onClick={() => onSelect(template)}
            >
              <h4 className="font-medium mb-1">{template.name}</h4>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {template.content}
              </p>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
