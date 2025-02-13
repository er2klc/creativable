
import { supabase } from "@/integrations/supabase/client";

export const updateLeadPhase = async (
  leadId: string,
  phaseId: string,
  oldPhaseName: string,
  newPhaseName: string,
  userId: string
) => {
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

  const timestamp = new Date().toISOString();

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

  // Eine einzige, konsistente Notiz für die Phasenänderung erstellen
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
        change_hash: `${leadId}-${timestamp}-${phaseId}`, // Eindeutiger Hash
        timestamp
      }
    });

  if (noteError) throw noteError;

  return { success: true };
};
