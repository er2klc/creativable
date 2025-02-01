import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSettings } from "@/hooks/use-settings";
import { useToast } from "@/hooks/use-toast";
import { Tables } from "@/integrations/supabase/types";

export const usePhaseMutations = () => {
  const { settings } = useSettings();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const updateLeadPhase = useMutation({
    mutationFn: async ({ 
      leadId, 
      phaseId, 
      oldPhaseName,
      newPhaseName 
    }: { 
      leadId: string; 
      phaseId: string;
      oldPhaseName: string;
      newPhaseName: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No authenticated user");

      // First check if the phase has actually changed
      const { data: currentLead } = await supabase
        .from("leads")
        .select("phase_id")
        .eq("id", leadId)
        .single();

      // If the phase hasn't changed, don't do anything
      if (currentLead?.phase_id === phaseId) {
        return;
      }

      // Update the lead's phase
      const { error: updateError } = await supabase
        .from("leads")
        .update({
          phase_id: phaseId,
          last_action: settings?.language === "en" ? "Phase changed" : "Phase geändert",
          last_action_date: new Date().toISOString(),
        })
        .eq("id", leadId);

      if (updateError) throw updateError;

      // Create a note for the phase change
      const { error: noteError } = await supabase
        .from("notes")
        .insert({
          lead_id: leadId,
          user_id: user.id,
          content: `Phase von "${oldPhaseName}" zu "${newPhaseName}" geändert`,
          color: '#E9D5FF',
          metadata: {
            type: 'phase_change',
            oldPhase: oldPhaseName,
            newPhase: newPhaseName
          }
        });

      if (noteError) throw noteError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      toast({
        title: settings?.language === "en" ? "Phase updated" : "Phase aktualisiert",
        description: settings?.language === "en"
          ? "The phase has been successfully updated"
          : "Die Phase wurde erfolgreich aktualisiert",
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

  const addPhase = useMutation({
    mutationFn: async ({ name, pipelineId }: { name: string; pipelineId: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No authenticated user found");

      // Get the current highest order_index
      const { data: phases } = await supabase
        .from("pipeline_phases")
        .select("order_index")
        .eq("pipeline_id", pipelineId)
        .order("order_index", { ascending: false })
        .limit(1);

      const nextOrderIndex = phases && phases.length > 0 ? phases[0].order_index + 1 : 0;

      const { error } = await supabase
        .from("pipeline_phases")
        .insert({
          name,
          order_index: nextOrderIndex,
          pipeline_id: pipelineId,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pipeline-phases"] });
      toast({
        title: settings?.language === "en" ? "Phase added" : "Phase hinzugefügt",
        description: settings?.language === "en"
          ? "New phase has been added successfully"
          : "Neue Phase wurde erfolgreich hinzugefügt",
      });
    },
  });

  const updatePhaseName = useMutation({
    mutationFn: async ({ id, name }: { id: string; name: string }) => {
      const { error } = await supabase
        .from("pipeline_phases")
        .update({ name })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pipeline-phases"] });
      toast({
        title: settings?.language === "en" ? "Phase name updated" : "Phasenname aktualisiert",
        description: settings?.language === "en"
          ? "The phase name has been updated successfully"
          : "Der Phasenname wurde erfolgreich aktualisiert",
      });
    },
  });

  const deletePhase = useMutation({
    mutationFn: async ({ phaseId, targetPhaseId }: { phaseId: string; targetPhaseId: string }) => {
      // First update all leads in this phase to the target phase
      const { error: updateError } = await supabase
        .from("leads")
        .update({ phase_id: targetPhaseId })
        .eq("phase_id", phaseId);

      if (updateError) throw updateError;

      // Then delete the phase
      const { error } = await supabase
        .from("pipeline_phases")
        .delete()
        .eq("id", phaseId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pipeline-phases"] });
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      toast({
        title: settings?.language === "en" ? "Phase deleted" : "Phase gelöscht",
        description: settings?.language === "en"
          ? "The phase has been deleted successfully"
          : "Die Phase wurde erfolgreich gelöscht",
      });
    },
  });

  const updatePhaseOrder = useMutation({
    mutationFn: async (phases: Tables<"pipeline_phases">[]) => {
      const updates = phases.map((phase) => ({
        id: phase.id,
        name: phase.name,
        pipeline_id: phase.pipeline_id,
        order_index: phase.order_index,
      }));

      const { error } = await supabase
        .from("pipeline_phases")
        .upsert(updates);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pipeline-phases"] });
      toast({
        title: settings?.language === "en" ? "Phase order updated" : "Phasenreihenfolge aktualisiert",
        description: settings?.language === "en"
          ? "The phase order has been updated successfully"
          : "Die Phasenreihenfolge wurde erfolgreich aktualisiert",
      });
    },
  });

  return {
    updateLeadPhase,
    addPhase,
    updatePhaseName,
    deletePhase,
    updatePhaseOrder
  };
};