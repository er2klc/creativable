
import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSettings } from "@/hooks/use-settings";
import { toast } from "sonner";

// Konstante für den localStorage Key
const LAST_PIPELINE_KEY = 'lastSelectedPipelineId';

export function usePipelineManagement(initialPipelineId: string | null) {
  const { settings } = useSettings();
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

      // Prioritätsreihenfolge:
      // 1. Aktuelle Session (localStorage)
      // 2. Gespeicherte Pipeline aus Settings
      // 3. Erste verfügbare Pipeline
      
      const sessionPipelineId = localStorage.getItem(LAST_PIPELINE_KEY);
      const savedPipelineId = settings?.last_selected_pipeline_id;
      
      console.log("Current state:", {
        sessionPipeline: sessionPipelineId,
        savedPipeline: savedPipelineId,
        currentSelection: selectedPipelineId
      });

      // Wenn bereits eine gültige Pipeline ausgewählt ist, behalte sie
      if (selectedPipelineId && pipelines.some(p => p.id === selectedPipelineId)) {
        console.log("Keeping current selection:", selectedPipelineId);
        return;
      }

      // Versuche die Pipeline aus der Session zu laden
      if (sessionPipelineId && pipelines.some(p => p.id === sessionPipelineId)) {
        console.log("Using session pipeline:", sessionPipelineId);
        setSelectedPipelineId(sessionPipelineId);
        return;
      }

      // Versuche die gespeicherte Pipeline aus den Settings
      if (savedPipelineId && pipelines.some(p => p.id === savedPipelineId)) {
        console.log("Using saved pipeline:", savedPipelineId);
        setSelectedPipelineId(savedPipelineId);
        return;
      }

      // Fallback: Erste verfügbare Pipeline
      console.log("Using first available pipeline:", pipelines[0].id);
      setSelectedPipelineId(pipelines[0].id);
    };

    initializePipeline();
  }, [pipelines, settings?.last_selected_pipeline_id, selectedPipelineId]);

  // Update localStorage and settings when pipeline changes
  useEffect(() => {
    const updatePipelineSelection = async () => {
      if (!selectedPipelineId) return;

      // Session Storage aktualisieren
      localStorage.setItem(LAST_PIPELINE_KEY, selectedPipelineId);
      console.log("Updated session storage:", selectedPipelineId);

      // Settings in der Datenbank aktualisieren
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      console.log("Updating settings with pipeline:", selectedPipelineId);
      
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
        toast.error("Pipeline-Auswahl konnte nicht gespeichert werden");
      } else {
        console.log("Successfully saved pipeline selection:", selectedPipelineId);
        queryClient.invalidateQueries({ queryKey: ["settings"] });
      }
    };

    updatePipelineSelection();
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
