
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useSettings } from "@/hooks/use-settings";
import { useToast } from "@/hooks/use-toast";
import { deletePhase } from "@/services/phases/phaseService";

export const useDeletePhaseMutation = () => {
  const { settings } = useSettings();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ phaseId, targetPhaseId }: { phaseId: string; targetPhaseId: string }) => {
      await deletePhase(phaseId, targetPhaseId);
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
};
