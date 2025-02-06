
import { DialogHeader } from "@/components/ui/dialog";
import { useState } from "react";
import { useSettings } from "@/hooks/use-settings";
import { CompactPhaseSelector } from "./CompactPhaseSelector";
import { LeadWithRelations } from "@/types/leads";
import { DeleteLeadDialog } from "./header/DeleteLeadDialog";
import { LeadName } from "./header/LeadName";
import { Platform } from "@/config/platforms";
import { Tables } from "@/integrations/supabase/types";
import { HeaderActions } from "./header/HeaderActions";
import { useStatusChange } from "./hooks/useStatusChange";

export interface LeadDetailHeaderProps {
  lead: LeadWithRelations;
  onUpdateLead: (updates: Partial<Tables<"leads">>) => void;
  onDeleteLead: () => void;
}

export function LeadDetailHeader({ lead, onUpdateLead, onDeleteLead }: LeadDetailHeaderProps) {
  const { settings } = useSettings();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const { handleStatusChange } = useStatusChange(lead, onUpdateLead, settings);

  const handleDelete = () => {
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = () => {
    setShowDeleteDialog(false);
    onDeleteLead();
  };

  return (
    <>
      <DialogHeader className="p-6 bg-card border-b">
        <div className="flex flex-col space-y-4 h-[180px]">
          <div className="flex justify-between items-start border-b">
            <LeadName name={lead.name} platform={lead.platform as Platform} />
            <HeaderActions 
              status={lead.status || 'lead'}
              onStatusChange={handleStatusChange}
              onDelete={handleDelete}
            />
          </div>
          <CompactPhaseSelector
            lead={lead}
            onUpdateLead={onUpdateLead}
          />
        </div>
      </DialogHeader>

      <DeleteLeadDialog 
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDeleteConfirm}
      />
    </>
  );
}
