
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSettings } from "@/hooks/use-settings";
import { useToast } from "@/hooks/use-toast";

export const useLeadPhaseMutation = () => {
  const { settings } = useSettings();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
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
        return null;
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

      return { success: true };
    },
    onSuccess: (data) => {
      // Only show toast if there was actually a phase change
      if (data?.success) {
        queryClient.invalidateQueries({ queryKey: ["leads"] });
        toast({
          title: settings?.language === "en" ? "Phase updated" : "Phase aktualisiert",
          description: settings?.language === "en"
            ? "The phase has been successfully updated"
            : "Die Phase wurde erfolgreich aktualisiert",
        });
      }
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
};
