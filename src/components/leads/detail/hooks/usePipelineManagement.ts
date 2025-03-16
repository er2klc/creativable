
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSettings } from "@/hooks/use-settings";
import { toast } from "sonner";

export function usePipelineManagement(initialPipelineId: string | null) {
  const { settings } = useSettings();
  const queryClient = useQueryClient();
  const [selectedPipelineId, setSelectedPipelineId] = useState<string | null>(initialPipelineId);

  const { data: pipelines = [], isError: isPipelinesError } = useQuery({
    queryKey: ["pipelines"],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from("pipelines")
          .select("*")
          .order("order_index");

        if (error) throw error;
        return data;
      } catch (err) {
        console.error("Error fetching pipelines:", err);
        toast.error(
          settings?.language === "en" 
            ? "Error loading pipelines" 
            : "Fehler beim Laden der Pipelines"
        );
        return [];
      }
    },
  });

  const { data: phases = [], isError: isPhasesError } = useQuery({
    queryKey: ["phases", selectedPipelineId],
    queryFn: async () => {
      if (!selectedPipelineId) return [];

      try {
        // Only select columns that exist in the database
        const { data, error } = await supabase
          .from("pipeline_phases")
          .select("id, pipeline_id, name, order_index, created_at, updated_at")
          .eq("pipeline_id", selectedPipelineId)
          .order("order_index");

        if (error) {
          // Check if this is a "column does not exist" error
          if (error.message.includes("column") && error.message.includes("does not exist")) {
            console.error("Column error in pipeline_phases query:", error);
            // Try a more basic query instead
            const { data: basicData, error: basicError } = await supabase
              .from("pipeline_phases")
              .select("id, pipeline_id, name, order_index")
              .eq("pipeline_id", selectedPipelineId)
              .order("order_index");
              
            if (basicError) throw basicError;
            return basicData;
          }
          throw error;
        }
        return data;
      } catch (err) {
        console.error("Error fetching phases:", err);
        toast.error(
          settings?.language === "en" 
            ? "Error loading pipeline phases" 
            : "Fehler beim Laden der Pipeline-Phasen"
        );
        return [];
      }
    },
    enabled: !!selectedPipelineId,
    retry: false, // Don't retry if the query fails due to missing columns
  });

  const updateLeadPipeline = useMutation({
    mutationFn: async ({ leadId, pipelineId, phaseId }: { leadId: string; pipelineId: string; phaseId: string }) => {
      try {
        // First get the current lead data to check if phase actually changed
        const { data: currentLead, error: fetchError } = await supabase
          .from("leads")
          .select("phase_id")
          .eq("id", leadId)
          .single();

        if (fetchError) throw fetchError;

        // Only proceed with update if phase actually changed
        if (currentLead.phase_id !== phaseId) {
          // Update the lead's pipeline and phase
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

          // Get the new phase name
          const newPhase = phases.find(p => p.id === phaseId);
          if (!newPhase) throw new Error("Phase not found");

          // Create a note for the phase change
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
      } catch (err) {
        console.error("Error updating lead pipeline:", err);
        throw err;
      }
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["lead", variables.leadId] });
      
      // Only show toast if this was triggered by a user action, not initial load
      if (variables.phaseId !== data.phase_id) {
        toast.success(
          settings?.language === "en" ? "Phase updated" : "Phase aktualisiert"
        );
      }
    },
    onError: (error) => {
      console.error("Error updating lead phase:", error);
      toast.error(
        settings?.language === "en" 
          ? "Error updating phase" 
          : "Fehler beim Aktualisieren der Phase"
      );
    }
  });

  useEffect(() => {
    if (pipelines.length > 0) {
      if (initialPipelineId && pipelines.some(p => p.id === initialPipelineId)) {
        setSelectedPipelineId(initialPipelineId);
      } else {
        // Get last used pipeline from localStorage
        const lastUsedPipelineId = localStorage.getItem('lastUsedPipelineId');
        const validPipeline = lastUsedPipelineId && pipelines.some(p => p.id === lastUsedPipelineId);
        
        if (validPipeline) {
          setSelectedPipelineId(lastUsedPipelineId);
        } else {
          // If no valid last used pipeline, use the first one
          setSelectedPipelineId(pipelines[0].id);
          localStorage.setItem('lastUsedPipelineId', pipelines[0].id);
        }
      }
    }
  }, [initialPipelineId, pipelines]);

  // Update localStorage whenever selected pipeline changes
  useEffect(() => {
    if (selectedPipelineId) {
      localStorage.setItem('lastUsedPipelineId', selectedPipelineId);
    }
  }, [selectedPipelineId]);

  return {
    selectedPipelineId,
    setSelectedPipelineId,
    pipelines,
    phases,
    updateLeadPipeline,
    isError: isPipelinesError || isPhasesError
  };
}
