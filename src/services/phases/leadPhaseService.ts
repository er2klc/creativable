
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";

export const updateLeadPhase = async (
  leadId: string,
  phaseId: string,
  oldPhaseName: string,
  newPhaseName: string,
  userId: string
) => {
  // WICHTIG: Erst prüfen ob sich die Phase tatsächlich geändert hat!
  // Keine Meldung oder Datenbankaktualisierung wenn die Phase gleich bleibt.
  // Dies verhindert unnötige Benachrichtigungen und Datenbankoperationen.
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
      last_action_date: new Date().toISOString(),
    })
    .eq("id", leadId);

  if (updateError) throw updateError;

  // Nur wenn die Phase wirklich geändert wurde, erstellen wir einen Eintrag
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
