
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";

export const updateLeadPhase = async (
  leadId: string,
  phaseId: string,
  oldPhaseName: string,
  newPhaseName: string,
  userId: string
) => {
  // First check if the phase has actually changed
  const { data: currentLead } = await supabase
    .from("leads")
    .select("phase_id")
    .eq("id", leadId)
    .single();

  // If the phase hasn't changed, return early
  if (currentLead?.phase_id === phaseId) {
    return null;
  }

  // Update the lead's phase
  const { error: updateError } = await supabase
    .from("leads")
    .update({
      phase_id: phaseId,
      last_action: "Phase changed",
      last_action_date: new Date().toISOString(),
    })
    .eq("id", leadId);

  if (updateError) throw updateError;

  // Create a note for the phase change
  const { error: noteError } = await supabase
    .from("notes")
    .insert({
      lead_id: leadId,
      user_id: userId,
      content: `Phase von "${oldPhaseName}" zu "${newPhaseName}" geändert`,
      color: '#E9D5FF',
      metadata: {
        type: 'phase_change',
        oldPhase: oldPhaseName,
        newPhase: newPhaseName
      }
    });

  if (noteError) throw noteError;

  return { success: true };
};
