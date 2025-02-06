
import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSettings } from "@/hooks/use-settings";
import { toast } from "sonner";

export function usePipelineManagement(initialPipelineId: string | null) {
  const { settings } = useSettings();
  const [selectedPipelineId, setSelectedPipelineId] = useState<string | null>(initialPipelineId);
  const queryClient = useQueryClient();

  const { data: pipelines = [] } = useQuery({
    queryKey: ["pipelines"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pipelines")
        .select("*")
        .order("order_index");

      if (error) throw error;
      console.log("Fetched pipelines:", data?.length);
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

  // Initialize pipeline selection with better logic
  useEffect(() => {
    if (pipelines.length > 0 && !selectedPipelineId) {
      // Only select a pipeline if we don't have one selected yet
      let pipelineToSelect: string | null = null;

      // Priority 1: Last selected pipeline from settings
      if (settings?.last_selected_pipeline_id && 
          pipelines.some(p => p.id === settings.last_selected_pipeline_id)) {
        console.log("Using last selected pipeline from settings:", settings.last_selected_pipeline_id);
        pipelineToSelect = settings.last_selected_pipeline_id;
      } 
      // Priority 2: First available pipeline (base pipeline) - only if no saved selection
      else if (!settings?.last_selected_pipeline_id && pipelines[0]) {
        console.log("No saved pipeline selection, using first pipeline:", pipelines[0].id);
        pipelineToSelect = pipelines[0].id;
      }

      if (pipelineToSelect) {
        setSelectedPipelineId(pipelineToSelect);
      }
    }
  }, [pipelines, settings?.last_selected_pipeline_id, selectedPipelineId]);

  // Update settings when pipeline changes
  useEffect(() => {
    const updateSettings = async () => {
      if (selectedPipelineId) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        console.log("Updating last selected pipeline in settings to:", selectedPipelineId);
        
        const { error } = await supabase
          .from('settings')
          .upsert({ 
            user_id: user.id,
            last_selected_pipeline_id: selectedPipelineId 
          }, {
            onConflict: 'user_id'
          });
        
        if (error) {
          console.error("Error updating last selected pipeline:", error);
          toast.error("Failed to save pipeline selection");
        } else {
          console.log("Successfully updated last selected pipeline:", selectedPipelineId);
          // Invalidate settings query to ensure it's reloaded
          queryClient.invalidateQueries({ queryKey: ["settings"] });
        }
      }
    };

    updateSettings();
  }, [selectedPipelineId, queryClient]);

  const invalidatePipelines = () => {
    queryClient.invalidateQueries({ queryKey: ["pipelines"] });
  };

  return {
    selectedPipelineId,
    setSelectedPipelineId,
    pipelines,
    phases,
    invalidatePipelines,
  };
}
