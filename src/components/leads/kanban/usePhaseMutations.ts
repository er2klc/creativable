import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useSettings } from "@/hooks/use-settings";
import { useSession } from "@supabase/auth-helpers-react";
import { Tables } from "@/integrations/supabase/types";

export const usePhaseMutations = () => {
  const queryClient = useQueryClient();
  const { settings } = useSettings();
  const session = useSession();

  const updateLeadPhase = useMutation({
    mutationFn: async ({ leadId, phaseId }: { leadId: string; phaseId: string }) => {
      if (!session?.user?.id) {
        throw new Error("No authenticated user found");
      }

      const { error } = await supabase
        .from("leads")
        .update({
          phase_id: phaseId,
          last_action: settings?.language === "en" ? "Phase changed" : "Phase geändert",
          last_action_date: new Date().toISOString(),
        })
        .eq("id", leadId)
        .eq("user_id", session.user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      toast(
        settings?.language === "en" ? "Phase updated" : "Phase aktualisiert",
        {
          description: settings?.language === "en"
            ? "Contact phase has been updated successfully"
            : "Kontaktphase wurde erfolgreich aktualisiert",
        }
      );
    },
  });

  const addPhase = useMutation({
    mutationFn: async ({ name, pipelineId }: { name: string, pipelineId: string }) => {
      if (!session?.user?.id) {
        throw new Error("No authenticated user found");
      }

      // Get all existing phases for this pipeline
      const { data: existingPhases, error: fetchError } = await supabase
        .from("pipeline_phases")
        .select("name, order_index")
        .eq("pipeline_id", pipelineId);

      if (fetchError) throw fetchError;

      // Generate unique name
      let finalName = name;
      let counter = 1;
      const existingNames = existingPhases?.map(p => p.name) || [];
      
      while (existingNames.includes(finalName)) {
        finalName = `${name} ${counter}`;
        counter++;
      }

      // Get highest order_index
      const maxOrderIndex = existingPhases?.reduce((max, phase) => 
        Math.max(max, phase.order_index), -1) ?? -1;

      // Insert the new phase
      const { error: insertError } = await supabase
        .from("pipeline_phases")
        .insert({
          name: finalName,
          pipeline_id: pipelineId,
          order_index: maxOrderIndex + 1,
        });

      if (insertError) throw insertError;
      
      return finalName;
    },
    onSuccess: (finalName) => {
      queryClient.invalidateQueries({ queryKey: ["pipeline-phases"] });
      toast(
        settings?.language === "en" ? "Phase added" : "Phase hinzugefügt",
        {
          description: settings?.language === "en"
            ? `The phase "${finalName}" has been added successfully`
            : `Die Phase "${finalName}" wurde erfolgreich hinzugefügt`,
        }
      );
    },
  });

  const updatePhaseName = useMutation({
    mutationFn: async ({ id, name }: { id: string; name: string }) => {
      if (!session?.user?.id) {
        throw new Error("No authenticated user found");
      }

      const { error } = await supabase
        .from("pipeline_phases")
        .update({ name })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pipeline-phases"] });
      toast(
        settings?.language === "en" ? "Phase updated" : "Phase aktualisiert",
        {
          description: settings?.language === "en"
            ? "Phase name has been updated successfully"
            : "Phasenname wurde erfolgreich aktualisiert",
        }
      );
    },
  });

  const updatePhaseOrder = useMutation({
    mutationFn: async (phases: Tables<"pipeline_phases">[]) => {
      if (!session?.user?.id) {
        throw new Error("No authenticated user found");
      }

      const updates = phases.map((phase) => ({
        id: phase.id,
        order_index: phase.order_index,
        pipeline_id: phase.pipeline_id,
        name: phase.name
      }));

      const { error } = await supabase
        .from("pipeline_phases")
        .upsert(updates);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pipeline-phases"] });
      toast(
        settings?.language === "en" ? "Order updated" : "Reihenfolge aktualisiert",
        {
          description: settings?.language === "en"
            ? "Phase order has been updated successfully"
            : "Phasenreihenfolge wurde erfolgreich aktualisiert",
        }
      );
    },
  });

  const deletePhase = useMutation({
    mutationFn: async ({ phaseId, targetPhaseId }: { phaseId: string, targetPhaseId: string }) => {
      if (!session?.user?.id) {
        throw new Error("No authenticated user found");
      }

      // First update all leads in the phase being deleted
      const { error: updateError } = await supabase
        .from("leads")
        .update({ 
          phase_id: targetPhaseId,
          last_action: settings?.language === "en" ? "Phase changed" : "Phase geändert",
          last_action_date: new Date().toISOString(),
        })
        .eq("phase_id", phaseId)
        .eq("user_id", session.user.id);

      if (updateError) throw updateError;

      // Then delete the phase
      const { error: deleteError } = await supabase
        .from("pipeline_phases")
        .delete()
        .eq("id", phaseId);

      if (deleteError) throw deleteError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pipeline-phases"] });
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      toast(
        settings?.language === "en" ? "Phase deleted" : "Phase gelöscht",
        {
          description: settings?.language === "en"
            ? "Phase has been deleted and contacts have been moved successfully"
            : "Phase wurde gelöscht und Kontakte wurden erfolgreich verschoben",
        }
      );
    },
  });

  return { updateLeadPhase, addPhase, updatePhaseName, deletePhase, updatePhaseOrder };
};