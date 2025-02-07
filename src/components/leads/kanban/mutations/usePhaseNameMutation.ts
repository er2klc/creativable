
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useSettings } from "@/hooks/use-settings";
import { useToast } from "@/hooks/use-toast";
import { updatePhaseName } from "@/services/phases/phaseService";

export const usePhaseNameMutation = () => {
  const { settings } = useSettings();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, name }: { id: string; name: string }) => {
      await updatePhaseName(id, name);
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
};
