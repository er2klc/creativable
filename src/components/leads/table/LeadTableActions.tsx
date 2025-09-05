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

interface LeadTableActionsProps {
  lead: Tables<"leads">;
  onShowDetails: () => void;
}

export const LeadTableActions = ({ lead, onShowDetails }: LeadTableActionsProps) => {
  const { settings } = useSettings();

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
        <DropdownMenuItem className="text-destructive">
          {settings?.language === "en" ? "Delete" : "Löschen"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};