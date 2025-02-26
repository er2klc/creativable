
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
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No authenticated user");
      
      const result = await updateLeadPhase(leadId, phaseId, oldPhaseName, newPhaseName, user.id);
      
      // Force immediate cache update
      await queryClient.invalidateQueries({ queryKey: ["lead", leadId] });
      await queryClient.invalidateQueries({ queryKey: ["lead-with-relations", leadId] });
      await queryClient.invalidateQueries({ queryKey: ["lead-timeline", leadId] });
      
      return result;
    },
    onSuccess: (data, variables) => {
      // Invalidieren aller relevanten Queries
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
