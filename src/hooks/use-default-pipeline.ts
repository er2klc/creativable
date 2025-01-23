import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useUser } from "@supabase/auth-helpers-react";
import { toast } from "sonner";

export const useDefaultPipeline = () => {
  const user = useUser();
  const queryClient = useQueryClient();

  // Prüfe ob Benutzer bereits eine Pipeline hat
  const { data: existingPipeline } = useQuery({
    queryKey: ["default-pipeline", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from("pipelines")
        .select("*")
        .eq("user_id", user.id)
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  // Mutation zum Erstellen der Pipeline und Phasen
  const createDefaultPipeline = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error("No user found");

      // Erstelle Pipeline
      const { data: pipeline, error: pipelineError } = await supabase
        .from("pipelines")
        .insert({
          user_id: user.id,
          name: "Pipeline",
          order_index: 0,
        })
        .select()
        .single();

      if (pipelineError) throw pipelineError;

      // Erstelle Standard-Phasen
      const defaultPhases = [
        { name: "Kontakt erstellt", order_index: 0 },
        { name: "Kontaktaufnahme", order_index: 1 },
        { name: "Kennenlernen", order_index: 2 },
        { name: "Präsentation", order_index: 3 },
        { name: "Follow-Up", order_index: 4 },
      ];

      const { error: phasesError } = await supabase
        .from("pipeline_phases")
        .insert(
          defaultPhases.map(phase => ({
            ...phase,
            pipeline_id: pipeline.id,
          }))
        );

      if (phasesError) throw phasesError;

      return pipeline;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["default-pipeline"] });
      queryClient.invalidateQueries({ queryKey: ["pipelines"] });
      queryClient.invalidateQueries({ queryKey: ["pipeline-phases"] });
    },
    onError: (error) => {
      console.error("Error creating default pipeline:", error);
      toast.error("Fehler beim Erstellen der Standard-Pipeline");
    },
  });

  useEffect(() => {
    // Wenn der Benutzer keine Pipeline hat, erstelle eine
    if (user?.id && existingPipeline === null) {
      createDefaultPipeline.mutate();
    }
  }, [user?.id, existingPipeline]);

  return {
    hasDefaultPipeline: !!existingPipeline,
    isCreating: createDefaultPipeline.isPending,
  };
};