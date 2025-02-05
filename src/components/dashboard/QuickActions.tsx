import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  UserPlus, 
  Calendar, 
  MessageSquare, 
  CheckSquare,
  Users,
  Building2
} from "lucide-react";
import { useSettings } from "@/hooks/use-settings";
import { AddLeadDialog } from "@/components/leads/AddLeadDialog";

export const QuickActions = () => {
  const navigate = useNavigate();
  const { settings } = useSettings();
  const [showAddLeadDialog, setShowAddLeadDialog] = useState(false);

  const actions = [
    {
      icon: UserPlus,
      label: settings?.language === "en" ? "New Contact" : "Neuer Kontakt",
      onClick: () => setShowAddLeadDialog(true),
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
      icon: Building2,
      label: settings?.language === "en" ? "My Teams" : "Meine Teams",
      onClick: () => navigate("/unity"),
    },
  ];

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {actions.map((action, index) => (
          <Button
            key={index}
            variant="outline"
            className="w-full h-24 flex flex-col gap-2 items-center justify-center hover:bg-primary/5 transition-all duration-200 hover:scale-105"
            onClick={action.onClick}
          >
            <action.icon className="h-6 w-6" />
            <span className="text-sm text-center">{action.label}</span>
          </Button>
        ))}
      </div>

      <AddLeadDialog 
        open={showAddLeadDialog} 
        onOpenChange={setShowAddLeadDialog}
      />
    </>
  );
};