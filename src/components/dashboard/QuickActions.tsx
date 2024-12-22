import { Plus, Send, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SendMessageDialog } from "@/components/messaging/SendMessageDialog";

export const QuickActions = () => {
  return (
    <div className="flex gap-4 mb-8">
      <Button className="flex items-center gap-2">
        <Plus className="h-4 w-4" />
        Neuer Lead
      </Button>
      <SendMessageDialog />
      <Button variant="outline" className="flex items-center gap-2">
        <MessageCircle className="h-4 w-4" />
        Kalender öffnen
      </Button>
    </div>
  );
};