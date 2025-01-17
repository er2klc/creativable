import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Bot } from "lucide-react";
import { Tables } from "@/integrations/supabase/types";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSettings } from "@/hooks/use-settings";
import { LeadInfoCard } from "./LeadInfoCard";
import { LeadSummary } from "./LeadSummary";
import { LeadDetailHeader } from "./LeadDetailHeader";
import { CompactPhaseSelector } from "./CompactPhaseSelector";
import { LeadDetailTabs } from "./LeadDetailTabs";
import { LeadTimeline } from "./LeadTimeline";
import { toast } from "sonner";
import { type Platform } from "@/config/platforms";

interface LeadDetailViewProps {
  leadId: string | null;
  onClose: () => void;
}

export const LeadDetailView = ({ leadId, onClose }: LeadDetailViewProps) => {
  const { settings } = useSettings();
  const queryClient = useQueryClient();

  const { data: lead, isLoading } = useQuery({
    queryKey: ["lead", leadId],
    queryFn: async () => {
      if (!leadId) return null;
      const { data, error } = await supabase
        .from("leads")
        .select("*, messages(*), tasks(*), notes(*)")
        .eq("id", leadId)
        .single();

      if (error) throw error;
      return data as (Tables<"leads"> & {
        platform: Platform;
        messages: Tables<"messages">[];
        tasks: Tables<"tasks">[];
        notes: Tables<"notes">[];
      });
    },
    enabled: !!leadId,
  });

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
      queryClient.invalidateQueries({ queryKey: ["lead", leadId] });
      toast.success(
        settings?.language === "en"
          ? "Contact updated successfully"
          : "Kontakt erfolgreich aktualisiert"
      );
    },
  });

  return (
    <Dialog open={!!leadId} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-4xl h-[90vh] bg-white border rounded-lg shadow-lg overflow-hidden">
        <DialogHeader className="p-0">
          <DialogTitle className="sr-only">
            {settings?.language === "en" ? "Contact Details" : "Kontaktdetails"}
          </DialogTitle>
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
          <div className="flex-1 overflow-y-auto p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left column */}
              <div className="space-y-6">
                <CompactPhaseSelector
                  lead={lead}
                  onUpdateLead={updateLeadMutation.mutate}
                />
                
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Bot className="h-5 w-5" />
                    <h3 className="text-lg font-semibold">
                      {settings?.language === "en" ? "AI Summary" : "KI-Zusammenfassung"}
                    </h3>
                  </div>
                  <LeadSummary lead={lead} />
                </div>
                
                <LeadInfoCard lead={lead} />
              </div>

              {/* Right column */}
              <div className="space-y-6">
                <LeadDetailTabs lead={lead} />
                <LeadTimeline lead={lead} />
              </div>
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
};