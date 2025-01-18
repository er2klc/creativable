import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import { Tables } from "@/integrations/supabase/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSettings } from "@/hooks/use-settings";
import { LeadDetailHeader } from "./LeadDetailHeader";
import { LeadContent } from "./LeadContent";
import { toast } from "sonner";
import { useLeadQuery } from "./hooks/useLeadQuery";

interface LeadDetailViewProps {
  leadId: string | null;
  onClose: () => void;
}

export const LeadDetailView = ({ leadId, onClose }: LeadDetailViewProps) => {
  const { settings } = useSettings();
  const queryClient = useQueryClient();

  const { data: lead, isLoading, error } = useLeadQuery(leadId);

  const updateLeadMutation = useMutation({
    mutationFn: async (updates: Partial<Tables<"leads">>) => {
      if (!leadId) return null;
      const { data, error } = await supabase
        .from("leads")
        .update(updates)
        .eq("id", leadId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      // Invalidate both the lead query and the notes query to refresh the timeline
      queryClient.invalidateQueries({ queryKey: ["lead", leadId] });
      toast.success(
        settings?.language === "en"
          ? "Contact updated successfully"
          : "Kontakt erfolgreich aktualisiert"
      );
    },
  });

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

        {isLoading ? (
          <div className="p-6">
            {settings?.language === "en" ? "Loading..." : "Lädt..."}
          </div>
        ) : lead ? (
          <LeadContent lead={lead} onUpdateLead={updateLeadMutation.mutate} />
        ) : null}
      </DialogContent>
    </Dialog>
  );
};