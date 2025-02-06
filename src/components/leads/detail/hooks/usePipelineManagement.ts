import { useState, useEffect } from 'react';
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
  });

  useEffect(() => {
    // If an initial pipeline ID is provided, use that
    if (initialPipelineId) {
      setSelectedPipelineId(initialPipelineId);
      localStorage.setItem('lastUsedPipelineId', initialPipelineId);
      return;
    }

    // If we have pipelines loaded
    if (pipelines.length > 0) {
      // Try to get the last used pipeline ID from localStorage
      const lastUsedPipelineId = localStorage.getItem('lastUsedPipelineId');
      
      // Check if the last used pipeline still exists
      const lastUsedPipelineExists = lastUsedPipelineId && 
        pipelines.some(p => p.id === lastUsedPipelineId);

      if (lastUsedPipelineExists) {
        // Use the last used pipeline if it exists
        setSelectedPipelineId(lastUsedPipelineId);
      } else {
        // Otherwise use the first pipeline
        setSelectedPipelineId(pipelines[0].id);
        localStorage.setItem('lastUsedPipelineId', pipelines[0].id);
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
  };
}
