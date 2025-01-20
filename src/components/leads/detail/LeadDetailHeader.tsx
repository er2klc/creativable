import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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
      <div className="flex flex-col space-y-1.5">
        <h2 className="text-xl font-semibold">
          {lead.name}
        </h2>
      </div>
      <div className="mt-4">
        <PoolCategorySelector lead={lead} onUpdateLead={onUpdateLead} />
      </div>
    </div>
  );
}