import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Tables } from "@/integrations/supabase/types";
import { supabase } from "@/integrations/supabase/client";
import { useUser } from "@supabase/auth-helpers-react";
import { useSettings } from "@/hooks/use-settings";
import { toast } from "sonner";

export const useLeadMutations = (leadId: string | null) => {
  const queryClient = useQueryClient();
  const user = useUser();
  const { settings } = useSettings();

  const updateLeadMutation = useMutation({
    mutationFn: async (updates: Partial<Tables<"leads">>) => {
      if (!leadId || !user?.id) {
        throw new Error("Invalid lead ID or user not authenticated");
      }

      // Get current lead data from cache
      const currentLead = queryClient.getQueryData<Tables<"leads">>(["lead", leadId]);

      // Check if there are actual changes
      const hasChanges = Object.entries(updates).some(
        ([key, value]) => currentLead?.[key as keyof Tables<"leads">] !== value
      );

      // If no changes, return current data without updating
      if (!hasChanges) {
        return currentLead;
      }

      // First create the phase change note if this is a phase change
      if (updates.phase_id) {
        const oldPhase = currentLead?.phase_id;
        const newPhase = updates.phase_id;
        
        if (oldPhase !== newPhase) {
          const { error: noteError } = await supabase
            .from("notes")
            .insert({
              lead_id: leadId,
              user_id: user.id,
              content: `Phase von "${oldPhase}" zu "${newPhase}" geändert`,
              color: "#E9D5FF",
              metadata: {
                type: "phase_change",
                oldPhase,
                newPhase
              }
            });

          if (noteError) {
            console.error("Error creating phase change note:", noteError);
            throw noteError;
          }
        }
      }

      // Then update the lead
      const { data, error } = await supabase
        .from("leads")
        .update(updates)
        .eq("id", leadId)
        .select()
        .single();

      if (error) throw error;
      return { data, hasChanges };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["lead", leadId] });
      
      // Only show success toast if there were actual changes
      if (result.hasChanges) {
        toast.success(
          settings?.language === "en"
            ? "Contact updated successfully"
            : "Kontakt erfolgreich aktualisiert"
        );
      }
    },
    onError: (error) => {
      console.error("Error updating lead:", error);
      toast.error(
        settings?.language === "en"
          ? "Error updating contact"
          : "Fehler beim Aktualisieren des Kontakts"
      );
    }
  });

  const deletePhaseChangeMutation = useMutation({
    mutationFn: async (noteId: string) => {
      const { error } = await supabase
        .from("notes")
        .delete()
        .eq("id", noteId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lead", leadId] });
      toast.success(
        settings?.language === "en"
          ? "Phase change deleted successfully"
          : "Phasenänderung erfolgreich gelöscht"
      );
    },
  });

  return {
    updateLeadMutation,
    deletePhaseChangeMutation
  };
};