
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSettings } from "@/hooks/use-settings";
import { toast } from "sonner";

export function usePipelineManagement(initialPipelineId: string | null) {
  const { settings } = useSettings();
  const queryClient = useQueryClient();
  const [selectedPipelineId, setSelectedPipelineId] = useState<string | null>(null);

  const { data: pipelines = [] } = useQuery({
    queryKey: ["pipelines"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pipelines")
        .select("*")
        .order("order_index");

      if (error) throw error;
      console.log("Fetched pipelines in hook:", data?.length);
      return data;
    },
  });

  const { data: phases = [] } = useQuery({
    queryKey: ["phases", selectedPipelineId],
    queryFn: async () => {
      if (!selectedPipelineId) return [];

      const { data, error } = await supabase
        .from("pipeline_phases")
        .select("*")
        .eq("pipeline_id", selectedPipelineId)
        .order("order_index");

      if (error) throw error;
      return data;
    },
    enabled: !!selectedPipelineId,
  });

  const updateLeadPipeline = useMutation({
    mutationFn: async ({ leadId, pipelineId, phaseId }: { leadId: string; pipelineId: string; phaseId: string }) => {
      const { data: currentLead, error: fetchError } = await supabase
        .from("leads")
        .select("phase_id")
        .eq("id", leadId)
        .single();

      if (fetchError) throw fetchError;

      if (currentLead.phase_id !== phaseId) {
        const { data: updatedLead, error: updateError } = await supabase
          .from("leads")
          .update({
            pipeline_id: pipelineId,
            phase_id: phaseId,
          })
          .eq("id", leadId)
          .select()
          .single();

        if (updateError) throw updateError;

        const newPhase = phases.find(p => p.id === phaseId);
        if (!newPhase) throw new Error("Phase not found");

        const { error: noteError } = await supabase
          .from("notes")
          .insert({
            lead_id: leadId,
            user_id: (await supabase.auth.getUser()).data.user?.id,
            content: `Phase wurde zu "${newPhase.name}" geändert`,
            metadata: {
              type: 'phase_change',
              phase_id: phaseId,
              phase_name: newPhase.name
            }
          });

        if (noteError) throw noteError;

        return updatedLead;
      }

      return currentLead;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["lead", variables.leadId] });
      
      if (variables.phaseId !== data.phase_id) {
        toast.success(
          settings?.language === "en" ? "Phase updated" : "Phase aktualisiert"
        );
      }
    },
  });

  // Pipeline-Initialisierung
  useEffect(() => {
    if (pipelines.length > 0) {
      console.log("Pipeline initialization effect running");
      console.log("Current selectedPipelineId:", selectedPipelineId);
      console.log("Settings last_selected_pipeline_id:", settings?.last_selected_pipeline_id);
      
      if (!selectedPipelineId || !pipelines.some(p => p.id === selectedPipelineId)) {
        let pipelineToSelect: string | null = null;

        // Priorität 1: Zuletzt ausgewählte Pipeline aus den Settings
        if (settings?.last_selected_pipeline_id && 
            pipelines.some(p => p.id === settings.last_selected_pipeline_id)) {
          pipelineToSelect = settings.last_selected_pipeline_id;
          console.log("Using pipeline from settings:", pipelineToSelect);
        }
        // Priorität 2: Erste verfügbare Pipeline
        else {
          pipelineToSelect = pipelines[0].id;
          console.log("Using first available pipeline:", pipelineToSelect);
        }

        if (pipelineToSelect) {
          console.log("Setting selected pipeline to:", pipelineToSelect);
          setSelectedPipelineId(pipelineToSelect);
          localStorage.setItem('lastUsedPipelineId', pipelineToSelect);
        }
      }
    }
  }, [pipelines, settings?.last_selected_pipeline_id, selectedPipelineId]);

  return {
    selectedPipelineId,
    setSelectedPipelineId,
    pipelines,
    phases,
    updateLeadPipeline,
  };
}
