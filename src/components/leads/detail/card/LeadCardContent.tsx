import { Tables } from "@/integrations/supabase/types";
import { format } from "date-fns";
import { de } from "date-fns/locale";

interface LeadCardContentProps {
  lead: Tables<"leads">;
}

export const LeadCardContent = ({ lead }: LeadCardContentProps) => {
  return (
    <div className="p-4">
      <div className="text-sm text-muted-foreground">
        {lead.created_at && (
          <div>
            Erstellt am: {format(new Date(lead.created_at), "dd.MM.yyyy", { locale: de })}
          </div>
        )}
      </div>
    </div>
  );
};