import { useEffect } from "react";
import { useSession } from "@supabase/auth-helpers-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSettings } from "@/hooks/use-settings";
import { Tables } from "@/integrations/supabase/types";
import { CompactPhaseSelector } from "./CompactPhaseSelector";

interface LeadDetailViewProps {
  leadId: string | null;
  onClose: () => void;
}

export const LeadDetailView = ({ leadId, onClose }: LeadDetailViewProps) => {
  const { settings } = useSettings();
  const queryClient = useQueryClient();
  const session = useSession();

  // First get the default pipeline
  const { data: pipeline } = useQuery({
    queryKey: ["default-pipeline"],
    queryFn: async () => {
      if (!session?.user?.id) return null;
      
      const { data, error } = await supabase
        .from("pipelines")
        .select("*")
        .eq("user_id", session.user.id)
        .order("order_index")
        .limit(1)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!session?.user?.id,
  });

  // Then get the phases for that pipeline
  const { data: phases = [] } = useQuery({
    queryKey: ["pipeline-phases", pipeline?.id],
    queryFn: async () => {
      if (!pipeline?.id) return [];
      
      const { data, error } = await supabase
        .from("pipeline_phases")
        .select("*")
        .eq("pipeline_id", pipeline.id)
        .order("order_index");

      if (error) throw error;
      return data;
    },
    enabled: !!pipeline?.id,
  });

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
        platform: string;
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

  const updatePhaseOrderMutation = useMutation({
    mutationFn: async (updatedPhases: Tables<"pipeline_phases">[]) => {
      const { error } = await supabase
        .from("pipeline_phases")
        .upsert(
          updatedPhases.map(phase => ({
            id: phase.id,
            name: phase.name,
            order_index: phase.order_index,
            pipeline_id: phase.pipeline_id
          }))
        );

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pipeline-phases"] });
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
                phases={phases}
                onUpdateLead={updateLeadMutation.mutate}
                onUpdatePhases={(phases) => updatePhaseOrderMutation.mutate(phases)}
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
