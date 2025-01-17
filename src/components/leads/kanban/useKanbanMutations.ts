import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSettings } from "@/hooks/use-settings";
import { useToast } from "@/hooks/use-toast";
import { useSession } from "@supabase/auth-helpers-react";

export const useKanbanMutations = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { settings } = useSettings();
  const session = useSession();

  const updateLeadPhase = useMutation({
    mutationFn: async ({ leadId, newPhase }: { leadId: string; newPhase: string }) => {
      if (!session?.user?.id) {
        throw new Error("No authenticated user found");
      }

      const { error } = await supabase
        .from("leads")
        .update({ 
          phase: newPhase,
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
  });

  const addPhase = useMutation({
    mutationFn: async () => {
      if (!session?.user?.id) {
        throw new Error("No authenticated user found");
      }

      // Get the default pipeline
      const { data: pipeline } = await supabase
        .from("pipelines")
        .select("*")
        .eq("user_id", session.user.id)
        .order("order_index")
        .limit(1)
        .single();

      if (!pipeline) throw new Error("No pipeline found");

      // Get the current highest order_index
      const { data: phases } = await supabase
        .from("pipeline_phases")
        .select("order_index")
        .eq("pipeline_id", pipeline.id)
        .order("order_index", { ascending: false })
        .limit(1);

      const nextOrderIndex = phases && phases.length > 0 ? phases[0].order_index + 1 : 0;

      const { error } = await supabase
        .from("pipeline_phases")
        .insert({
          name: settings?.language === "en" ? "New Phase" : "Neue Phase",
          order_index: nextOrderIndex,
          pipeline_id: pipeline.id,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pipeline-phases"] });
      toast({
        title: settings?.language === "en" ? "Phase added" : "Phase hinzugefügt",
        description: settings?.language === "en"
          ? "New phase has been added successfully"
          : "Neue Phase wurde erfolgreich hinzugefügt",
      });
    },
  });

  return { updateLeadPhase, addPhase };
};