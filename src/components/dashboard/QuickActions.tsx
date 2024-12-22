import { Plus, Send, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export const QuickActions = () => {
  const navigate = useNavigate();

  return (
    <div className="flex gap-4 mb-8">
      <Button className="flex items-center gap-2">
        <Plus className="h-4 w-4" />
        Neuer Lead
      </Button>
      <Button 
        variant="outline" 
        className="flex items-center gap-2"
        onClick={() => navigate("/leads?action=send-message")}
      >
        <Send className="h-4 w-4" />
        Nachricht senden
      </Button>
      <Button variant="outline" className="flex items-center gap-2">
        <MessageCircle className="h-4 w-4" />
        Kalender öffnen
      </Button>
    </div>
  );
};