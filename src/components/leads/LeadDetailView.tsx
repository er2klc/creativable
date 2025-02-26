
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSettings } from "@/hooks/use-settings";
import { LeadDetailHeader } from "./detail/LeadDetailHeader";
import { useLeadSubscription } from "./detail/hooks/useLeadSubscription";
import { LeadWithRelations } from "@/types/leads";
import { LeadDetailContent } from "./detail/LeadDetailContent";
import { useLeadMutations } from "./detail/hooks/useLeadMutations";
import { toast } from "sonner";

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
        toast.error(
          settings?.language === "en" 
            ? "Invalid contact ID" 
            : "Ungültige Kontakt-ID"
        );
        onClose();
        return null;
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

      if (error) {
        console.error("Error fetching lead:", error);
        toast.error(
          settings?.language === "en"
            ? "Error loading contact"
            : "Fehler beim Laden des Kontakts"
        );
        onClose();
        return null;
      }

      if (!data) {
        toast.error(
          settings?.language === "en" 
            ? "Contact not found" 
            : "Kontakt nicht gefunden"
        );
        onClose();
        return null;
      }

      return data as LeadWithRelations;
    },
    enabled: !!leadId && isValidUUID(leadId),
    retry: false,
  });

  const { updateLeadMutation, deleteLeadMutation } = useLeadMutations(leadId, onClose);
  useLeadSubscription(leadId);

  if (!lead && !isLoading) {
    return null;
  }

  return (
    <Dialog open={!!leadId} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-4xl h-[90vh] p-0 bg-white border rounded-lg shadow-lg overflow-hidden">
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
              console.log("Delete phase change:", noteId);
            }}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};
