import { Button } from "@/components/ui/button";
import { MoreVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SendMessageDialog } from "@/components/messaging/SendMessageDialog";
import { useSettings } from "@/hooks/use-settings";
import { Tables } from "@/integrations/supabase/types";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface LeadTableActionsProps {
  lead: Tables<"leads">;
  onShowDetails: () => void;
}

export const LeadTableActions = ({ lead, onShowDetails }: LeadTableActionsProps) => {
  const { settings } = useSettings();
  const navigate = useNavigate();

  const handleDelete = async () => {
    try {
      const { error } = await supabase
        .from("leads")
        .delete()
        .eq("id", lead.id);

      if (error) throw error;

      toast.success(
        settings?.language === "en" 
          ? "Contact deleted successfully" 
          : "Kontakt erfolgreich gelöscht"
      );
      
      // Navigate back to contacts page
      navigate("/contacts");
    } catch (error) {
      console.error("Error deleting contact:", error);
      toast.error(
        settings?.language === "en"
          ? "Failed to delete contact"
          : "Fehler beim Löschen des Kontakts"
      );
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={onShowDetails}>
          {settings?.language === "en" ? "Show Details" : "Details anzeigen"}
        </DropdownMenuItem>
        <SendMessageDialog
          lead={lead}
          trigger={
            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
              {settings?.language === "en" ? "Send Message" : "Nachricht senden"}
            </DropdownMenuItem>
          }
        />
        <DropdownMenuItem 
          className="text-destructive"
          onClick={handleDelete}
        >
          {settings?.language === "en" ? "Delete" : "Löschen"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};