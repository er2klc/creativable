import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSettings } from "@/hooks/use-settings";
import { LeadDetailHeader } from "./LeadDetailHeader";
import { useLeadSubscription } from "./hooks/useLeadSubscription";
import { LeadWithRelations } from "@/types/leads";
import { LeadDetailContent } from "./components/LeadDetailContent";
import { useLeadMutations } from "./hooks/useLeadMutations";

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
  
  const { data: lead, isLoading } = useQuery({
    queryKey: ["lead", leadId],
    queryFn: async () => {
      if (!leadId || !isValidUUID(leadId)) {
        throw new Error("Invalid lead ID");
      }

      const { data, error } = await supabase
        .from("leads")
        .select(`
          *,
          messages (*),
          tasks (*),
          notes (*),
          lead_files (*),
          linkedin_posts (*)
        `)
        .eq("id", leadId)
        .maybeSingle();

      // 🚀 Filtere Statusänderungen aus `notes`
      if (data && data.notes) {
        data.notes = data.notes.filter((note) => note.metadata?.type !== "status_change");
      }

      if (error) {
        console.error("Error fetching lead:", error);
        throw error;
      }

      if (!data) {
        throw new Error("Lead not found");
      }

      return data as unknown as LeadWithRelations;
    },
    enabled: !!leadId && isValidUUID(leadId),
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * Math.pow(2, attemptIndex), 10000),
  });

  const { updateLeadMutation, deleteLeadMutation } = useLeadMutations(leadId, onClose);
  useLeadSubscription(leadId);

  return (
    <Dialog open={!!leadId} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-4xl h-[90vh] bg-white border rounded-lg shadow-lg overflow-hidden">
        <DialogHeader className="p-0">
          {lead && (
            <LeadDetailHeader
              lead={lead}
              onUpdateLead={updateLeadMutation.mutate}
              onDeleteLead={() => deleteLeadMutation.mutate()}
            />
          )}
        </DialogHeader>

        {lead && (
          <LeadDetailContent 
            lead={lead}
            onUpdateLead={updateLeadMutation.mutate}
            isLoading={isLoading}
            onDeleteClick={() => deleteLeadMutation.mutate()}
            onDeletePhaseChange={(noteId) => {
              // Handle phase change deletion
              console.log("Delete phase change:", noteId);
            }}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};
