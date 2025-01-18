import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useSettings } from "@/hooks/use-settings";
import { useSession } from "@supabase/auth-helpers-react";

export const usePhaseMutations = () => {
  const { toast } = useToast();
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
      toast({
        title: settings?.language === "en" ? "Phase updated" : "Phase aktualisiert",
        description: settings?.language === "en"
          ? "Contact phase has been updated successfully"
          : "Kontaktphase wurde erfolgreich aktualisiert",
      });
    },
    onError: (error) => {
      console.error("Error updating phase:", error);
      toast({
        title: settings?.language === "en" ? "Error" : "Fehler",
        description: settings?.language === "en"
          ? "Failed to update phase. Please try again."
          : "Phase konnte nicht aktualisiert werden. Bitte versuchen Sie es erneut.",
        variant: "destructive",
      });
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
      toast({
        title: settings?.language === "en" ? "Phase added" : "Phase hinzugefügt",
        description: settings?.language === "en"
          ? `The phase "${finalName}" has been added successfully`
          : `Die Phase "${finalName}" wurde erfolgreich hinzugefügt`,
      });
    },
    onError: (error) => {
      console.error("Error adding phase:", error);
      toast({
        variant: "destructive",
        title: settings?.language === "en" ? "Error" : "Fehler",
        description: settings?.language === "en"
          ? "Failed to add phase"
          : "Fehler beim Hinzufügen der Phase",
      });
    },
  });

  const updatePhaseName = useMutation({
    mutationFn: async ({ id, name, oldName }: { id: string; name: string; oldName: string }) => {
      if (!session?.user?.id) {
        throw new Error("No authenticated user found");
      }

      console.log("Starting phase rename operation:", { id, name, oldName });

      // First verify that leads exist with the old phase ID
      const { data: existingLeads, error: checkError } = await supabase
        .from("leads")
        .select("id")
        .eq("phase_id", id)
        .eq("user_id", session.user.id);

      if (checkError) {
        console.error("Error checking existing leads:", checkError);
        throw checkError;
      }

      console.log("Found leads to update:", existingLeads?.length || 0);

      // First update the phase name
      const { error: phaseError } = await supabase
        .from("pipeline_phases")
        .update({ name })
        .eq("id", id);

      if (phaseError) {
        console.error("Error updating phase name:", phaseError);
        throw phaseError;
      }

      console.log("Phase name updated successfully");

      // Return both results
      return { 
        phaseName: name, 
        oldName,
        updatedLeadsCount: existingLeads?.length || 0 
      };
    },
    onSuccess: (data) => {
      console.log("Phase rename operation completed successfully:", data);
      queryClient.invalidateQueries({ queryKey: ["pipeline-phases"] });
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      toast({
        title: settings?.language === "en" ? "Phase updated" : "Phase aktualisiert",
        description: settings?.language === "en"
          ? `Phase name has been updated successfully`
          : `Phasenname wurde erfolgreich aktualisiert`,
      });
    },
    onError: (error) => {
      console.error("Error in phase rename operation:", error);
      toast({
        title: settings?.language === "en" ? "Error" : "Fehler",
        description: settings?.language === "en"
          ? "Failed to update phase name. Please try again."
          : "Phasenname konnte nicht aktualisiert werden. Bitte versuchen Sie es erneut.",
        variant: "destructive",
      });
    }
  });

  return { updateLeadPhase, addPhase, updatePhaseName };
};