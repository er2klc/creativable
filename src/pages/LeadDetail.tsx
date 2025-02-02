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
  
  const { data: lead, isLoading } = useLeadData(leadId);
  const { updateLeadMutation, deleteLeadMutation } = useLeadMutations(leadId, () => {
    window.history.back();
  });

  const deletePhaseChangeMutation = useMutation({
    mutationFn: async (noteId: string) => {
      const { error } = await supabase
        .from("notes")
        .delete()
        .eq("id", noteId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lead", leadId] });
      toast.success(
        settings?.language === "en"
          ? "Phase change deleted successfully"
          : "Phasenänderung erfolgreich gelöscht"
      );
    },
    onError: (error) => {
      console.error("Error deleting phase change:", error);
      toast.error(
        settings?.language === "en"
          ? "Error deleting phase change"
          : "Fehler beim Löschen der Phasenänderung"
      );
    },
  });

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