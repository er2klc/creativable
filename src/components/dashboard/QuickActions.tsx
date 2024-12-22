import { Plus, Send, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export const QuickActions = () => {
  return (
    <div className="flex gap-4 mb-8">
      <Button className="flex items-center gap-2">
        <Plus className="h-4 w-4" />
        Neuer Lead
      </Button>
      <Button variant="outline" className="flex items-center gap-2">
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