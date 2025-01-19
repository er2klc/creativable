import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import { useSettings } from "@/hooks/use-settings";
import { LeadDetailHeader } from "./LeadDetailHeader";
import { LeadDetailContent } from "./LeadDetailContent";
import { toast } from "sonner";
import { useLeadQuery } from "./hooks/useLeadQuery";
import { useLeadMutations } from "./hooks/useLeadMutations";
import { useLeadSubscription } from "./hooks/useLeadSubscription";

interface LeadDetailViewProps {
  leadId: string | null;
  onClose: () => void;
}

export const LeadDetailView = ({ leadId, onClose }: LeadDetailViewProps) => {
  const { settings } = useSettings();
  const { data: lead, isLoading, error } = useLeadQuery(leadId);
  const { updateLeadMutation, deletePhaseChangeMutation } = useLeadMutations(leadId);

  // Set up real-time subscriptions
  useLeadSubscription(leadId);

  if (error) {
    toast.error(
      settings?.language === "en"
        ? "Error loading contact"
        : "Fehler beim Laden des Kontakts"
    );
    onClose();
    return null;
  }

  return (
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
            onDeletePhaseChange={deletePhaseChangeMutation.mutate}
            isLoading={isLoading}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};