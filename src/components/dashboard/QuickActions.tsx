import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  UserPlus, 
  Calendar, 
  MessageSquare, 
  CheckSquare,
  Users
} from "lucide-react";
import { useSettings } from "@/hooks/use-settings";

export const QuickActions = () => {
  const navigate = useNavigate();
  const { settings } = useSettings();

  const actions = [
    {
      icon: UserPlus,
      label: settings?.language === "en" ? "New Contact" : "Neuer Kontakt",
      onClick: () => navigate("/contacts?action=new"),
    },
    {
      icon: Calendar,
      label: settings?.language === "en" ? "Schedule Meeting" : "Termin planen",
      onClick: () => navigate("/calendar?action=new"),
    },
    {
      icon: MessageSquare,
      label: settings?.language === "en" ? "Send Message" : "Nachricht senden",
      onClick: () => navigate("/messages"),
    },
    {
      icon: CheckSquare,
      label: settings?.language === "en" ? "Add Task" : "Aufgabe erstellen",
      onClick: () => navigate("/todo?action=new"),
    },
    {
      icon: Users,
      label: settings?.language === "en" ? "View Contacts" : "Kontakte anzeigen",
      onClick: () => navigate("/contacts"),
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
      {actions.map((action, index) => (
        <Button
          key={index}
          variant="outline"
          className="w-full h-24 flex flex-col gap-2 items-center justify-center hover:bg-primary/5"
          onClick={action.onClick}
        >
          <action.icon className="h-6 w-6" />
          <span className="text-sm text-center">{action.label}</span>
        </Button>
      ))}
    </div>
  );
};