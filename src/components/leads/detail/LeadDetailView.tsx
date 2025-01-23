import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSettings } from "@/hooks/use-settings";
import { useState } from "react";
import { LeadWithRelations } from "./types/lead";
import { useLeadSubscription } from "./hooks/useLeadSubscription";
import { useLeadMutations } from "./hooks/useLeadMutations";
import { LeadDetailHeader } from "./components/LeadDetailHeader";
import { LeadDetailContent } from "./components/LeadDetailContent";
import { DeleteLeadDialog } from "./components/DeleteLeadDialog";

interface LeadDetailViewProps {
  leadId: string | null;
  onClose: () => void;
}

const isValidUUID = (uuid: string) => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};

export const LeadDetailView = ({ leadId, onClose }: LeadDetailViewProps) => {
  const { settings } = useSettings();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  
  const { updateLeadMutation, deleteLeadMutation } = useLeadMutations(leadId, onClose);

  const { data: lead, isLoading } = useQuery({
    queryKey: ["lead", leadId],
    queryFn: async () => {
      if (!leadId || !isValidUUID(leadId)) {
        throw new Error("Invalid lead ID");
      }

      const { data, error } = await supabase
        .from("leads")
        .select("*, messages(*), tasks(*), notes(*), lead_files(*)")
        .eq("id", leadId)
        .maybeSingle();

      if (error) {
        console.error("Error fetching lead:", error);
        throw error;
      }

      if (!data) {
        throw new Error("Lead not found");
      }

      return data as LeadWithRelations;
    },
    enabled: !!leadId && isValidUUID(leadId)
  });

  useLeadSubscription(leadId);

  return (
    <>
      <Dialog open={!!leadId} onOpenChange={() => onClose()}>
        <DialogContent className="max-w-4xl h-[90vh] bg-white border rounded-lg shadow-lg overflow-hidden">
          {lead && (
            <>
              <LeadDetailHeader 
                lead={lead}
                onUpdateLead={updateLeadMutation.mutate}
                onClose={onClose}
              />
              <LeadDetailContent
                lead={lead}
                onUpdateLead={updateLeadMutation.mutate}
                isLoading={isLoading}
                onDeleteClick={() => setShowDeleteDialog(true)}
              />
            </>
          )}
        </DialogContent>
      </Dialog>

      <DeleteLeadDialog 
        showDialog={showDeleteDialog} 
        setShowDialog={setShowDeleteDialog}
        onDelete={() => deleteLeadMutation.mutate()}
      />
    </>
  );
};