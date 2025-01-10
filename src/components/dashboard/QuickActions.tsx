import { Plus, Send, MessageCircle, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { AddLeadDialog } from "@/components/leads/AddLeadDialog";

export const QuickActions = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-wrap gap-4 mb-8">
      <AddLeadDialog trigger={
        <Button className="flex items-center gap-2 bg-[#1A1F2C]/80 hover:bg-[#2A2F3C]/80 text-white border border-white/10 shadow-lg backdrop-blur-sm">
          <Plus className="h-4 w-4" />
          Neuer Kontakt ✨
        </Button>
      } />
      <Button 
        variant="outline" 
        className="flex items-center gap-2 bg-[#1A1F2C]/60 hover:bg-[#2A2F3C]/60 text-white border border-white/10 shadow-lg backdrop-blur-sm"
        onClick={() => navigate("/leads?action=send-message")}
      >
        <Send className="h-4 w-4" />
        Nachricht senden 💬
      </Button>
      <Button 
        variant="outline" 
        className="flex items-center gap-2 bg-[#1A1F2C]/60 hover:bg-[#2A2F3C]/60 text-white border border-white/10 shadow-lg backdrop-blur-sm"
      >
        <Calendar className="h-4 w-4" />
        Kalender öffnen 📅
      </Button>
    </div>
  );
};