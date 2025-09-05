// Temporary simplified delete hook to avoid deep type instantiation
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export function useDeleteLeadSimple() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async (leadId: string) => {
      const { error } = await supabase
        .from("leads")
        .delete()
        .eq("id", leadId);

      if (error) throw error;
      return leadId;
    },
    onSuccess: () => {
      toast.success("Lead wurde erfolgreich gelöscht");
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      navigate("/leads");
    },
    onError: (error) => {
      console.error("Error deleting lead:", error);
      toast.error("Fehler beim Löschen des Leads");
    },
  });
}