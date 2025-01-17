import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import { Bot } from "lucide-react";
import { Tables } from "@/integrations/supabase/types";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSettings } from "@/hooks/use-settings";
import { LeadInfoCard } from "./LeadInfoCard";
import { TaskList } from "./TaskList";
import { NoteList } from "./NoteList";
import { LeadSummary } from "./LeadSummary";
import { LeadDetailHeader } from "./LeadDetailHeader";
import { LeadMessages } from "./LeadMessages";
import { CompactPhaseSelector } from "./CompactPhaseSelector";
import { toast } from "sonner";

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
        .select("*, messages(*), tasks(*)")
        .eq("id", leadId)
        .single();

      if (error) throw error;
      return data as (Tables<"leads"> & {
        messages: Tables<"messages">[];
        tasks: Tables<"tasks">[];
      });
    },
    enabled: !!leadId,
  });

  const updateLeadMutation = useMutation({
    mutationFn: async (updates: Partial<Tables<"leads">>) => {
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
          {lead && (
            <LeadDetailHeader
              lead={lead}
              onUpdateLead={updateLeadMutation.mutate}
            />
          )}
        </DialogHeader>

        {isLoading ? (
          <div className="p-6">{settings?.language === "en" ? "Loading..." : "Lädt..."}</div>
        ) : lead ? (
          <div className="flex-1 overflow-y-auto p-6">
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
              <TaskList leadId={lead.id} />
              <NoteList leadId={lead.id} />
              <LeadMessages messages={lead.messages} />
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
};