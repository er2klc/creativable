
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";

export const addPhase = async (name: string, pipelineId: string) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("No authenticated user found");

  // Get the current highest order_index
  const { data: phases } = await supabase
    .from("pipeline_phases")
    .select("order_index")
    .eq("pipeline_id", pipelineId)
    .order("order_index", { ascending: false })
    .limit(1);

  const nextOrderIndex = phases && phases.length > 0 ? phases[0].order_index + 1 : 0;

  const { error } = await supabase
    .from("pipeline_phases")
    .insert({
      name,
      order_index: nextOrderIndex,
      pipeline_id: pipelineId,
    });

  if (error) throw error;
};

export const updatePhaseName = async (id: string, name: string) => {
  const { error } = await supabase
    .from("pipeline_phases")
    .update({ name })
    .eq("id", id);

  if (error) throw error;
};

export const deletePhase = async (phaseId: string, targetPhaseId: string) => {
  // First update all leads in this phase to the target phase
  const { error: updateError } = await supabase
    .from("leads")
    .update({ phase_id: targetPhaseId })
    .eq("phase_id", phaseId);

  if (updateError) throw updateError;

  // Then delete the phase
  const { error } = await supabase
    .from("pipeline_phases")
    .delete()
    .eq("id", phaseId);

  if (error) throw error;
};

export const updatePhaseOrder = async (phases: Tables<"pipeline_phases">[]) => {
  const updates = phases.map((phase) => ({
    id: phase.id,
    name: phase.name,
    pipeline_id: phase.pipeline_id,
    order_index: phase.order_index,
  }));

  const { error } = await supabase
    .from("pipeline_phases")
    .upsert(updates);

  if (error) throw error;
};
