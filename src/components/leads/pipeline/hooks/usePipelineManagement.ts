
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

  // Pipeline selection initialization
  useEffect(() => {
    const initializePipeline = async () => {
      if (!pipelines.length) return;

      // Skip if we already have a selection
      if (selectedPipelineId && pipelines.some(p => p.id === selectedPipelineId)) {
        console.log("Keeping current pipeline selection:", selectedPipelineId);
        return;
      }

      // Get saved pipeline from settings
      const savedPipelineId = settings?.last_selected_pipeline_id;
      console.log("Saved pipeline from settings:", savedPipelineId);

      let pipelineToSelect: string | null = null;

      if (savedPipelineId && pipelines.some(p => p.id === savedPipelineId)) {
        console.log("Using saved pipeline:", savedPipelineId);
        pipelineToSelect = savedPipelineId;
      } else if (initialPipelineId && pipelines.some(p => p.id === initialPipelineId)) {
        console.log("Using initial pipeline:", initialPipelineId);
        pipelineToSelect = initialPipelineId;
      } else {
        console.log("Using first available pipeline:", pipelines[0].id);
        pipelineToSelect = pipelines[0].id;
      }

      setSelectedPipelineId(pipelineToSelect);
    };

    initializePipeline();
  }, [pipelines, settings?.last_selected_pipeline_id, initialPipelineId, selectedPipelineId]);

  // Persist pipeline selection to settings
  useEffect(() => {
    const updateSettings = async () => {
      if (!selectedPipelineId) return;

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      console.log("Saving pipeline selection to settings:", selectedPipelineId);
      
      const { error } = await supabase
        .from('settings')
        .upsert({ 
          user_id: user.id,
          last_selected_pipeline_id: selectedPipelineId 
        }, {
          onConflict: 'user_id'
        });
      
      if (error) {
        console.error("Error saving pipeline selection:", error);
        toast.error("Failed to save pipeline selection");
      } else {
        console.log("Successfully saved pipeline selection:", selectedPipelineId);
        queryClient.invalidateQueries({ queryKey: ["settings"] });
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
