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
      
      const lastUsedPipelineId = localStorage.getItem('lastUsedPipelineId');
      
      let query = supabase
        .from("pipelines")
        .select("*")
        .eq("user_id", session.user.id)
        .order("order_index");

      if (lastUsedPipelineId) {
        const { data: lastPipeline } = await query
          .eq("id", lastUsedPipelineId)
          .maybeSingle();
        
        if (lastPipeline) {
          return lastPipeline;
        }
      }

      const { data, error } = await query.limit(1).maybeSingle();

      if (error) throw error;

      if (data) {
        localStorage.setItem('lastUsedPipelineId', data.id);
      }

      return data;
    },
    enabled: !!session?.user?.id,
  });

  // Then get the phases for that pipeline
  const { data: phases = [], isLoading } = useQuery({
    queryKey: ["pipeline-phases", pipeline?.id],
    queryFn: async () => {
      if (!session?.user?.id || !pipeline?.id) return [];
      
      const { data: existingPhases, error } = await supabase
        .from("pipeline_phases")
        .select("*")
        .eq("pipeline_id", pipeline.id)
        .order("order_index");

      if (error) throw error;
      return existingPhases;
    },
    enabled: !!session?.user?.id && !!pipeline?.id,
  });

  const addPhase = useMutation({
    mutationFn: async (baseName: string) => {
      if (!session?.user?.id || !pipeline?.id) {
        throw new Error("No pipeline selected");
      }

      // Get all existing phases for this pipeline
      const { data: existingPhases, error: fetchError } = await supabase
        .from("pipeline_phases")
        .select("name, order_index")
        .eq("pipeline_id", pipeline.id)
        .order("order_index", { ascending: false });

      if (fetchError) throw fetchError;

      // Generate unique name by checking if it exists
      let name = baseName;
      let counter = 1;
      const existingNames = existingPhases?.map(p => p.name) || [];
      
      while (existingNames.includes(name)) {
        name = `${baseName}_${counter}`;
        counter++;
      }

      // Find the highest order_index
      const maxOrderIndex = existingPhases?.length ? Math.max(...existingPhases.map(p => p.order_index)) : -1;

      // Insert the new phase
      const { error: insertError } = await supabase
        .from("pipeline_phases")
        .insert({
          name,
          pipeline_id: pipeline.id,
          order_index: maxOrderIndex + 1,
        });

      if (insertError) throw insertError;
      
      return name;
    },
    onSuccess: (finalName) => {
      queryClient.invalidateQueries({ queryKey: ["pipeline-phases", pipeline?.id] });
      toast({
        title: settings?.language === "en" ? "Phase added" : "Phase hinzugefügt",
        description: settings?.language === "en"
          ? `The phase "${finalName}" has been added successfully`
          : `Die Phase "${finalName}" wurde erfolgreich hinzugefügt`,
      });
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: settings?.language === "en" ? "Error" : "Fehler",
        description: settings?.language === "en"
          ? "Failed to add phase"
          : "Fehler beim Hinzufügen der Phase",
      });
    },
  });

  const updatePhaseOrder = useMutation({
    mutationFn: async (updatedPhases: Tables<"pipeline_phases">[]) => {
      const updates = updatedPhases.map((phase) => ({
        id: phase.id,
        name: phase.name,
        pipeline_id: phase.pipeline_id,
        order_index: phase.order_index,
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

  const deletePhase = useMutation({
    mutationFn: async () => {
      if (!session?.user?.id || !phaseToDelete) {
        throw new Error("No phase selected");
      }

      // First update all leads in the phase being deleted
      const { error: updateError } = await supabase
        .from("leads")
        .update({ phase_id: targetPhase })
        .eq("phase_id", phaseToDelete.id)
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
      queryClient.invalidateQueries({ queryKey: ["pipeline-phases", pipeline?.id] });
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

  if (isLoading) {
    return <div>Loading...</div>;
  }

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
