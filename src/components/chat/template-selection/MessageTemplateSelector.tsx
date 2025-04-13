
import { MessageTemplateType } from "@/config/messageTemplates";
import { Button } from "@/components/ui/button";
import { MessageSquare, Clock, Calendar, Users, MessageCircle } from "lucide-react";

interface MessageTemplateSelectorProps {
  onSelect: (type: MessageTemplateType) => void;
  selectedType: MessageTemplateType;
}

const templates: Array<{
  type: MessageTemplateType;
  label: string;
  icon: React.ReactNode;
  description: string;
}> = [
  {
    type: 'first_contact',
    label: 'Erste Kontaktaufnahme',
    icon: <MessageSquare className="h-4 w-4" />,
    description: 'Perfekt für den ersten Kontakt'
  },
  {
    type: 'follow_up',
    label: 'Follow-up',
    icon: <Clock className="h-4 w-4" />,
    description: 'Nach einer vorherigen Interaktion'
  },
  {
    type: 'event_invitation',
    label: 'Event Einladung',
    icon: <Calendar className="h-4 w-4" />,
    description: 'Lade zu einem Event ein'
  },
  {
    type: 'collaboration',
    label: 'Zusammenarbeit',
    icon: <Users className="h-4 w-4" />,
    description: 'Schlage eine Kooperation vor'
  },
  {
    type: 'feedback',
    label: 'Feedback',
    icon: <MessageCircle className="h-4 w-4" />,
    description: 'Bitte um Feedback oder Meinung'
  }
];

export const MessageTemplateSelector = ({
  onSelect,
  selectedType
}: MessageTemplateSelectorProps) => {
  return (
    <div className="p-4 space-y-2 bg-muted/50 rounded-lg mb-4">
      <h3 className="font-medium mb-3">Wähle eine Nachrichtenvorlage:</h3>
      <div className="grid grid-cols-1 gap-2">
        {templates.map((template) => (
          <Button
            key={template.type}
            variant={selectedType === template.type ? "default" : "outline"}
            className="flex items-center justify-start gap-3 h-auto py-3"
            onClick={() => onSelect(template.type)}
          >
            {template.icon}
            <div className="text-left">
              <div className="font-medium">{template.label}</div>
              <div className="text-xs text-muted-foreground">{template.description}</div>
            </div>
          </Button>
        ))}
      </div>
    </div>
  );
};
