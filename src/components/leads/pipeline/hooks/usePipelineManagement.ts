
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSettings } from "@/hooks/use-settings";
import { toast } from "sonner";

export function usePipelineManagement(initialPipelineId: string | null) {
  const { settings } = useSettings();
  const queryClient = useQueryClient();
  const [selectedPipelineId, setSelectedPipelineId] = useState<string | null>(initialPipelineId);

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

  // Initialize pipeline selection when data is available
  useEffect(() => {
    if (pipelines.length > 0 && !selectedPipelineId) {
      let pipelineToSelect: string | null = null;

      // Priority 1: Last selected pipeline from settings
      if (settings?.last_selected_pipeline_id && 
          pipelines.some(p => p.id === settings.last_selected_pipeline_id)) {
        pipelineToSelect = settings.last_selected_pipeline_id;
      } 
      // Priority 2: First available pipeline
      else if (pipelines[0]) {
        pipelineToSelect = pipelines[0].id;
      }

      if (pipelineToSelect) {
        console.log("Setting initial pipeline:", pipelineToSelect);
        setSelectedPipelineId(pipelineToSelect);
      }
    }
  }, [pipelines, settings?.last_selected_pipeline_id, selectedPipelineId]);

  // Update settings when pipeline changes
  useEffect(() => {
    if (selectedPipelineId) {
      const updateSettings = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { error } = await supabase
          .from('settings')
          .update({ last_selected_pipeline_id: selectedPipelineId })
          .eq('user_id', user.id);
        
        if (error) {
          console.error("Error updating last selected pipeline:", error);
        }
      };

      updateSettings();
    }
  }, [selectedPipelineId]);

  return {
    selectedPipelineId,
    setSelectedPipelineId,
    pipelines,
    phases,
  };
}
