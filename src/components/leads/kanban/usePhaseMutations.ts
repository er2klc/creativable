import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useSettings } from "@/hooks/use-settings";
import { useSession } from "@supabase/auth-helpers-react";

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
    onError: (error) => {
      console.error("Error updating phase:", error);
      toast(
        settings?.language === "en" ? "Error" : "Fehler",
        {
          description: settings?.language === "en"
            ? "Failed to update phase. Please try again."
            : "Phase konnte nicht aktualisiert werden. Bitte versuchen Sie es erneut.",
        }
      );
    }
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
    onError: (error) => {
      console.error("Error adding phase:", error);
      toast(
        settings?.language === "en" ? "Error" : "Fehler",
        {
          description: settings?.language === "en"
            ? "Failed to add phase"
            : "Fehler beim Hinzufügen der Phase",
        }
      );
    }
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
    onError: (error) => {
      console.error("Error updating phase name:", error);
      toast(
        settings?.language === "en" ? "Error" : "Fehler",
        {
          description: settings?.language === "en"
            ? "Failed to update phase name"
            : "Fehler beim Aktualisieren des Phasennamens",
        }
      );
    }
  });

  const deletePhase = useMutation({
    mutationFn: async (phaseId: string) => {
      if (!session?.user?.id) {
        throw new Error("No authenticated user found");
      }

      // First check if there are any leads in this phase
      const { data: leads, error: leadsError } = await supabase
        .from("leads")
        .select("id")
        .eq("phase_id", phaseId);

      if (leadsError) throw leadsError;

      if (leads && leads.length > 0) {
        throw new Error("Cannot delete phase with leads");
      }

      const { error } = await supabase
        .from("pipeline_phases")
        .delete()
        .eq("id", phaseId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pipeline-phases"] });
      toast(
        settings?.language === "en" ? "Phase deleted" : "Phase gelöscht",
        {
          description: settings?.language === "en"
            ? "Phase has been deleted successfully"
            : "Phase wurde erfolgreich gelöscht",
        }
      );
    },
    onError: (error) => {
      console.error("Error deleting phase:", error);
      const errorMessage = error.message === "Cannot delete phase with leads"
        ? settings?.language === "en"
          ? "Cannot delete phase that contains contacts"
          : "Phase mit Kontakten kann nicht gelöscht werden"
        : settings?.language === "en"
          ? "Failed to delete phase"
          : "Fehler beim Löschen der Phase";

      toast(
        settings?.language === "en" ? "Error" : "Fehler",
        {
          description: errorMessage,
        }
      );
    }
  });

  const updatePipelineName = useMutation({
    mutationFn: async ({ id, name }: { id: string; name: string }) => {
      if (!session?.user?.id) {
        throw new Error("No authenticated user found");
      }

      const { error } = await supabase
        .from("pipelines")
        .update({ name })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pipelines"] });
      toast(
        settings?.language === "en" ? "Pipeline updated" : "Pipeline aktualisiert",
        {
          description: settings?.language === "en"
            ? "Pipeline name has been updated successfully"
            : "Pipeline-Name wurde erfolgreich aktualisiert",
        }
      );
    },
    onError: (error) => {
      console.error("Error updating pipeline name:", error);
      toast(
        settings?.language === "en" ? "Error" : "Fehler",
        {
          description: settings?.language === "en"
            ? "Failed to update pipeline name"
            : "Fehler beim Aktualisieren des Pipeline-Namens",
        }
      );
    }
  });

  return { updateLeadPhase, addPhase, updatePhaseName, deletePhase, updatePipelineName };
};