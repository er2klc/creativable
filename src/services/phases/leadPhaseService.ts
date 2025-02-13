
import { supabase } from "@/integrations/supabase/client";

export const updateLeadPhase = async (
  leadId: string,
  phaseId: string,
  oldPhaseName: string,
  newPhaseName: string,
  userId: string
) => {
  const timestamp = new Date().toISOString();
  const changeHash = `${leadId}-${timestamp}-${phaseId}`;

  // WICHTIG: Erst prüfen ob sich die Phase tatsächlich geändert hat!
  const { data: currentLead } = await supabase
    .from("leads")
    .select("phase_id")
    .eq("id", leadId)
    .single();

  // Wenn die Phase identisch ist, early return ohne Änderungen
  if (currentLead?.phase_id === phaseId) {
    console.log("Phase unchanged, skipping update");
    return null;
  }

  // Phase hat sich geändert - Update durchführen
  const { error: updateError } = await supabase
    .from("leads")
    .update({
      phase_id: phaseId,
      last_action: "Phase changed",
      last_action_date: timestamp,
    })
    .eq("id", leadId);

  if (updateError) throw updateError;

  // Prüfen ob bereits eine Notiz für diese Änderung existiert
  const { data: existingNotes } = await supabase
    .from("notes")
    .select("id")
    .eq("lead_id", leadId)
    .eq("metadata->type", "phase_change")
    .eq("metadata->change_hash", changeHash);

  // Nur eine neue Notiz erstellen, wenn noch keine existiert
  if (!existingNotes || existingNotes.length === 0) {
    const { error: noteError } = await supabase
      .from("notes")
      .insert({
        lead_id: leadId,
        user_id: userId,
        content: `Phase wurde von "${oldPhaseName}" zu "${newPhaseName}" geändert`,
        metadata: {
          type: 'phase_change',
          oldPhase: oldPhaseName,
          newPhase: newPhaseName,
          change_hash: changeHash,
          timestamp
        }
      });

    if (noteError) throw noteError;
  }

  return { success: true };
};
