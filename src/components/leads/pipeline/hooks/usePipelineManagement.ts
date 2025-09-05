
import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

// Constant for localStorage key
const LAST_PIPELINE_KEY = 'lastSelectedPipelineId';

export function usePipelineManagement(initialPipelineId: string | null) {
  const [selectedPipelineId, setSelectedPipelineId] = useState<string | null>(null);
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

      // If there's already a valid pipeline selected, keep it
      if (selectedPipelineId && pipelines.some(p => p.id === selectedPipelineId)) {
        console.log("Keeping current selection:", selectedPipelineId);
        return;
      }

      // Try to load pipeline from session
      const sessionPipelineId = localStorage.getItem(LAST_PIPELINE_KEY);
      if (sessionPipelineId && pipelines.some(p => p.id === sessionPipelineId)) {
        console.log("Using session pipeline:", sessionPipelineId);
        setSelectedPipelineId(sessionPipelineId);
        return;
      }

      // Find first pipeline as default since is_default doesn't exist in current schema
      if (pipelines.length > 0) {
        console.log("Using first pipeline as default:", pipelines[0].id);
        setSelectedPipelineId(pipelines[0].id);
        return;
      }

      // Fallback: First available pipeline
      console.log("Using first available pipeline:", pipelines[0].id);
      setSelectedPipelineId(pipelines[0].id);
    };

    initializePipeline();
  }, [pipelines, selectedPipelineId]);

  // Update localStorage when pipeline changes
  useEffect(() => {
    if (!selectedPipelineId) return;
    localStorage.setItem(LAST_PIPELINE_KEY, selectedPipelineId);
    console.log("Updated session storage:", selectedPipelineId);
  }, [selectedPipelineId]);

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
