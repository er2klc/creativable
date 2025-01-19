import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@supabase/auth-helpers-react";
import { Tables } from "@/integrations/supabase/types";
import { useToast } from "@/hooks/use-toast";
import { useSettings } from "@/hooks/use-settings";

export const usePipelineManagement = (initialPipelineId?: string) => {
  const [selectedPipelineId, setSelectedPipelineId] = useState<string>(initialPipelineId || '');
  const session = useSession();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { settings } = useSettings();

  const { data: pipelines = [] } = useQuery({
    queryKey: ["pipelines"],
    queryFn: async () => {
      if (!session?.user?.id) return [];
      
      const { data, error } = await supabase
        .from("pipelines")
        .select("*")
        .eq("user_id", session.user.id)
        .order("order_index");

      if (error) throw error;
      return data;
    },
    enabled: !!session?.user?.id,
  });

  const { data: phases = [], isLoading: isPhasesLoading } = useQuery({
    queryKey: ["pipeline-phases", selectedPipelineId],
    queryFn: async () => {
      if (!session?.user?.id || !selectedPipelineId) return [];
      
      const { data, error } = await supabase
        .from("pipeline_phases")
        .select("*")
        .eq("pipeline_id", selectedPipelineId)
        .order("order_index");

      if (error) throw error;
      return data;
    },
    enabled: !!session?.user?.id && !!selectedPipelineId,
  });

  const updateLeadPipeline = useMutation({
    mutationFn: async ({ leadId, pipelineId, phaseId }: { leadId: string, pipelineId: string, phaseId: string }) => {
      if (!session?.user?.id) throw new Error("Not authenticated");

      const { data: oldLead } = await supabase
        .from("leads")
        .select("*, pipeline_phases!inner(*), pipelines!inner(*)")
        .eq("id", leadId)
        .single();

      const { data: newPhase } = await supabase
        .from("pipeline_phases")
        .select("*, pipelines!inner(*)")
        .eq("id", phaseId)
        .single();

      if (oldLead && newPhase) {
        const oldPhaseName = `${oldLead.pipelines.name} → ${oldLead.pipeline_phases.name}`;
        const newPhaseName = `${newPhase.pipelines.name} → ${newPhase.name}`;

        // Create phase change note
        await supabase
          .from("notes")
          .insert({
            lead_id: leadId,
            user_id: session.user.id,
            content: `Phase von "${oldPhaseName}" zu "${newPhaseName}" geändert`,
            color: "#E9D5FF",
            metadata: {
              type: "phase_change",
              oldPhase: oldPhaseName,
              newPhase: newPhaseName
            }
          });

        // Update lead
        const { error: updateError } = await supabase
          .from("leads")
          .update({
            pipeline_id: pipelineId,
            phase_id: phaseId,
            last_action: `Phase von "${oldPhaseName}" zu "${newPhaseName}" geändert`,
            last_action_date: new Date().toISOString()
          })
          .eq("id", leadId);

        if (updateError) throw updateError;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lead"] });
      toast({
        title: settings?.language === "en" ? "Phase updated" : "Phase aktualisiert",
        description: settings?.language === "en" 
          ? "The contact's phase has been updated successfully"
          : "Die Phase des Kontakts wurde erfolgreich aktualisiert",
      });
    },
    onError: (error) => {
      console.error("Error updating phase:", error);
      toast({
        variant: "destructive",
        title: settings?.language === "en" ? "Error" : "Fehler",
        description: settings?.language === "en"
          ? "Failed to update phase"
          : "Fehler beim Aktualisieren der Phase",
      });
    },
  });

  return {
    selectedPipelineId,
    setSelectedPipelineId,
    pipelines,
    phases,
    isPhasesLoading,
    updateLeadPipeline
  };
};