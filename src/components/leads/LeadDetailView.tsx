import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSettings } from "@/hooks/use-settings";
import { LeadDetailHeader } from "./detail/LeadDetailHeader";
import { useLeadSubscription } from "./detail/hooks/useLeadSubscription";
import { LeadWithRelations } from "./detail/types/lead";
import { useState } from "react";
import { LeadDetailContent } from "./detail/components/LeadDetailContent";
import { DeleteLeadDialog } from "./detail/header/DeleteLeadDialog";
import { useLeadMutations } from "./detail/hooks/useLeadMutations";

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
    enabled: !!leadId && isValidUUID(leadId),
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * Math.pow(2, attemptIndex), 10000),
  });

  const { updateLeadMutation, deleteLeadMutation } = useLeadMutations(leadId, onClose);
  useLeadSubscription(leadId);

  return (
    <>
      <Dialog open={!!leadId} onOpenChange={() => onClose()}>
        <DialogContent className="max-w-4xl h-[90vh] bg-white border rounded-lg shadow-lg overflow-hidden">
          <DialogHeader className="p-0">
            {lead && (
              <LeadDetailHeader
                lead={lead}
                onUpdateLead={updateLeadMutation.mutate}
              />
            )}
          </DialogHeader>

          {lead && (
            <LeadDetailContent
              lead={lead}
              onUpdateLead={updateLeadMutation.mutate}
              isLoading={isLoading}
              onDeleteClick={() => setShowDeleteDialog(true)}
            />
          )}

          {/* Delete Button */}
          <div className="absolute bottom-4 left-4">
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:text-red-600"
              onClick={() => setShowDeleteDialog(true)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <DeleteLeadDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={() => deleteLeadMutation.mutate()}
      />
    </>
  );
};