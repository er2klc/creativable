import { Button } from "@/components/ui/button";
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tables } from "@/integrations/supabase/types";
import { PoolCategorySelector } from "./PoolCategorySelector";
import { useSettings } from "@/hooks/use-settings";

interface LeadDetailHeaderProps {
  lead: Tables<"leads">;
  onUpdateLead: (updates: Partial<Tables<"leads">>) => void;
}

export function LeadDetailHeader({ lead, onUpdateLead }: LeadDetailHeaderProps) {
  const { settings } = useSettings();

  return (
    <div className="border-b p-4 sm:px-6">
      <DialogHeader>
        <DialogTitle className="text-xl font-semibold">
          {lead.name}
        </DialogTitle>
      </DialogHeader>
      <div className="mt-4">
        <PoolCategorySelector lead={lead} onUpdateLead={onUpdateLead} />
      </div>
    </div>
  );
}