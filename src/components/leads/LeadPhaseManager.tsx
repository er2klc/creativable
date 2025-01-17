import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useSettings } from "@/hooks/use-settings";
import { useSession } from "@supabase/auth-helpers-react";
import { PhaseList } from "./phases/PhaseList";
import { PhaseCreator } from "./phases/PhaseCreator";
import { DeletePhaseDialog } from "./phases/DeletePhaseDialog";
import { Tables } from "@/integrations/supabase/types";

export const LeadPhaseManager = () => {
  const [phaseToDelete, setPhaseToDelete] = useState<{ id: string; name: string } | null>(null);
  const [targetPhase, setTargetPhase] = useState<string>("");
  const { settings } = useSettings();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const session = useSession();

  // First get the default pipeline
  const { data: pipeline } = useQuery({
    queryKey: ["default-pipeline"],
    queryFn: async () => {
      if (!session?.user?.id) return null;
      
      const { data, error } = await supabase
        .from("pipelines")
        .select("*")
        .eq("user_id", session.user.id)
        .order("order_index")
        .limit(1)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!session?.user?.id,
  });

  // Then get the phases for that pipeline
  const { data: phases = [] } = useQuery({
    queryKey: ["pipeline-phases", pipeline?.id],
    queryFn: async () => {
      if (!pipeline?.id) return [];
      
      const { data, error } = await supabase
        .from("pipeline_phases")
        .select("*")
        .eq("pipeline_id", pipeline.id)
        .order("order_index");

      if (error) throw error;
      return data;
    },
    enabled: !!pipeline?.id,
  });

  const updatePhaseOrder = useMutation({
    mutationFn: async (updatedPhases: Tables<"pipeline_phases">[]) => {
      const updates = updatedPhases.map((phase, index) => ({
        id: phase.id,
        order_index: index,
      }));

      const { error } = await supabase
        .from("pipeline_phases")
        .upsert(updates);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pipeline-phases"] });
      toast({
        title: settings?.language === "en" ? "Order updated" : "Reihenfolge aktualisiert",
        description: settings?.language === "en"
          ? "Phase order has been updated successfully"
          : "Die Reihenfolge der Phasen wurde erfolgreich aktualisiert",
      });
    },
  });

  const addPhase = useMutation({
    mutationFn: async (name: string) => {
      if (!session?.user?.id || !pipeline?.id) {
        throw new Error("No pipeline selected");
      }

      const { error } = await supabase
        .from("pipeline_phases")
        .insert({
          name,
          pipeline_id: pipeline.id,
          order_index: phases.length,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pipeline-phases"] });
      toast({
        title: settings?.language === "en" ? "Phase added" : "Phase hinzugefügt",
        description: settings?.language === "en"
          ? "The phase has been added successfully"
          : "Die Phase wurde erfolgreich hinzugefügt",
      });
    },
  });

  const deletePhase = useMutation({
    mutationFn: async () => {
      if (!session?.user?.id || !phaseToDelete) {
        throw new Error("No phase selected");
      }

      // First update all leads in the phase being deleted
      const { error: updateError } = await supabase
        .from("leads")
        .update({ phase: targetPhase })
        .eq("phase", phaseToDelete.name)
        .eq("user_id", session.user.id);

      if (updateError) throw updateError;

      // Then delete the phase
      const { error: deleteError } = await supabase
        .from("pipeline_phases")
        .delete()
        .eq("id", phaseToDelete.id);

      if (deleteError) throw deleteError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pipeline-phases"] });
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      toast({
        title: settings?.language === "en" ? "Phase deleted" : "Phase gelöscht",
        description: settings?.language === "en"
          ? "The phase and its contacts have been moved successfully"
          : "Die Phase wurde gelöscht und die Kontakte wurden verschoben",
      });
      setPhaseToDelete(null);
      setTargetPhase("");
    },
  });

  return (
    <div className="space-y-4">
      <PhaseCreator onAddPhase={(name) => addPhase.mutate(name)} />
      
      <PhaseList
        phases={phases}
        onPhaseOrderChange={(newPhases) => updatePhaseOrder.mutate(newPhases)}
        onDeletePhase={setPhaseToDelete}
      />

      <DeletePhaseDialog
        phaseToDelete={phaseToDelete}
        targetPhase={targetPhase}
        setTargetPhase={setTargetPhase}
        onClose={() => setPhaseToDelete(null)}
        onConfirm={() => deletePhase.mutate()}
        phases={phases}
      />
    </div>
  );
};