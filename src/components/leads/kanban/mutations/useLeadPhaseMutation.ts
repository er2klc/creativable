
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useSettings } from "@/hooks/use-settings";
import { useToast } from "@/hooks/use-toast";
import { updateLeadPhase } from "@/services/phases/leadPhaseService";
import { supabase } from "@/integrations/supabase/client";

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
      console.log('Starting phase mutation for lead:', leadId);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No authenticated user");
      
      const result = await updateLeadPhase(leadId, phaseId, oldPhaseName, newPhaseName, user.id);
      console.log('Phase update completed:', result);
      
      return result;
    },
    onMutate: async (variables) => {
      // Cancel any outgoing refetches to avoid optimistic update conflicts
      await queryClient.cancelQueries({ queryKey: ["lead-timeline", variables.leadId] });
      await queryClient.cancelQueries({ queryKey: ["lead", variables.leadId] });
    },
    onSuccess: (data, variables) => {
      console.log('Phase mutation successful, invalidating queries');
      
      // Invalidate all relevant queries in the correct order
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      queryClient.invalidateQueries({ queryKey: ["lead", variables.leadId] });
      queryClient.invalidateQueries({ queryKey: ["lead-with-relations", variables.leadId] });
      queryClient.invalidateQueries({ queryKey: ["lead-timeline", variables.leadId] });
      
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
};
