
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

  return { success: true };
};
