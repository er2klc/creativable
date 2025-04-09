
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FileText, MessageCircle, PenTool, Phone, X } from "lucide-react";

interface MessageTemplateSelectorProps {
  onSelect: (type: string) => void;
  selectedType: string;
}

export const MessageTemplateSelector = ({ onSelect, selectedType }: MessageTemplateSelectorProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const templates = [
    { id: "introduction", label: "Einführung", icon: <MessageCircle className="h-4 w-4 mr-2" /> },
    { id: "follow_up", label: "Nachverfolgung", icon: <Phone className="h-4 w-4 mr-2" /> },
    { id: "proposal", label: "Angebot", icon: <FileText className="h-4 w-4 mr-2" /> },
    { id: "custom", label: "Benutzerdefiniert", icon: <PenTool className="h-4 w-4 mr-2" /> },
  ];

  const handleSelect = (value: string) => {
    onSelect(value);
    setIsOpen(false);
  };

  const handleClose = () => {
    onSelect("");
    setIsOpen(false);
  };

  return (
    <div className="p-2 border-t">
      {selectedType ? (
        <div className="flex items-center justify-between rounded-md bg-muted p-2">
          <div className="flex items-center">
            {templates.find(t => t.id === selectedType)?.icon}
            <span>{templates.find(t => t.id === selectedType)?.label} Vorlage</span>
          </div>
          <Button variant="ghost" size="sm" onClick={handleClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <Select value={selectedType} onValueChange={handleSelect}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Vorlage auswählen" />
          </SelectTrigger>
          <SelectContent>
            {templates.map(template => (
              <SelectItem key={template.id} value={template.id}>
                <div className="flex items-center">
                  {template.icon}
                  {template.label}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  );
};
