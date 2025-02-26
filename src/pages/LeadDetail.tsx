
import { useParams } from "react-router-dom";
import { useSettings } from "@/hooks/use-settings";
import { LeadDetailHeader } from "@/components/leads/detail/LeadDetailHeader";
import { useLeadSubscription } from "@/components/leads/detail/hooks/useLeadSubscription";
import { LeadDetailContent } from "@/components/leads/detail/LeadDetailContent";
import { useLeadData } from "./lead-detail/hooks/useLeadData";
import { useLeadMutations } from "./lead-detail/hooks/useLeadMutations";
import { LeadDetailLoading } from "./lead-detail/components/LeadDetailLoading";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function LeadDetail() {
  const { leadId } = useParams<{ leadId: string }>();
  const { settings } = useSettings();
  const queryClient = useQueryClient();
  
  // Enable suspense for better loading states
  const { data: lead, isLoading } = useLeadData(leadId);
  const { updateLeadMutation, deleteLeadMutation } = useLeadMutations(leadId, () => {
    window.history.back();
  });

  const deletePhaseChangeMutation = useMutation({
    mutationFn: async (noteId: string) => {
      if (noteId.startsWith('status-')) {
        const { error } = await supabase
          .from("leads")
          .update({ status: 'lead' })
          .eq("id", noteId.replace('status-', ''));

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("notes")
          .delete()
          .eq("id", noteId);

        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lead", leadId] });
      queryClient.invalidateQueries({ queryKey: ["lead-timeline", leadId] });
      toast.success(
        settings?.language === "en"
          ? "Entry deleted successfully"
          : "Eintrag erfolgreich gelöscht"
      );
    },
    onError: (error) => {
      console.error("Error deleting entry:", error);
      toast.error(
        settings?.language === "en"
          ? "Error deleting entry"
          : "Fehler beim Löschen des Eintrags"
      );
    },
  });

  // Set up subscription after initial data load
  useLeadSubscription(leadId);

  if (isLoading || !lead) {
    return <LeadDetailLoading />;
  }

  return (
    <div className="mx-auto py-6">
      <LeadDetailHeader
        lead={lead}
        onUpdateLead={updateLeadMutation.mutate}
        onDeleteLead={() => deleteLeadMutation.mutate()}
      />
      <LeadDetailContent 
        lead={lead}
        onUpdateLead={updateLeadMutation.mutate}
        isLoading={isLoading}
        onDeleteClick={() => deleteLeadMutation.mutate()}
        onDeletePhaseChange={(noteId) => deletePhaseChangeMutation.mutate(noteId)}
      />
    </div>
  );
}
