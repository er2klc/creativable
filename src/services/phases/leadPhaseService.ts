
import { supabase } from "@/integrations/supabase/client";

const getPhaseChangeMessage = (
  oldPhaseName: string | null, 
  newPhaseName: string
): { content: string; emoji: string } => {
  // Standard-Emojis für verschiedene Phasen
  const phaseEmojis: { [key: string]: string } = {
    "Erstkontakt": "👋",
    "Erstgespräch": "🗣️",
    "Angebot": "📝",
    "Verhandlung": "🤝",
    "Abschluss": "🎉",
    "Follow Up": "📞",
    "Onboarding": "🚀",
    "Nachfassen": "✍️"
  };

  // Emoji für die neue Phase bestimmen
  const emoji = phaseEmojis[newPhaseName] || "✨";

  // Wenn keine alte Phase vorhanden ist (erster Eintrag)
  if (!oldPhaseName) {
    return {
      content: `Neuer Kontakt startet in Phase "${newPhaseName}"`,
      emoji
    };
  }

  // Bewegungsrichtung ermitteln durch Vergleich der Phasennamen
  // (Dies ist nur ein Beispiel - Sie müssten die tatsächliche Reihenfolge Ihrer Phasen kennen)
  const isForward = true; // TODO: Implementieren Sie hier Ihre Logik für die Richtung

  if (isForward) {
    return {
      content: `Weiter zu Phase "${newPhaseName}"`,
      emoji
    };
  } else {
    return {
      content: `Zurück zu Phase "${newPhaseName}"`,
      emoji
    };
  }
};

export const updateLeadPhase = async (
  leadId: string,
  phaseId: string,
  oldPhaseName: string,
  newPhaseName: string,
  userId: string
) => {
  const timestamp = new Date().toISOString();

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

  // Prüfen ob bereits eine Notiz für diese spezifische Änderung in den letzten 5 Sekunden existiert
  const fiveSecondsAgo = new Date(Date.now() - 5000).toISOString();
  const { data: existingNotes } = await supabase
    .from("notes")
    .select("id")
    .eq("lead_id", leadId)
    .eq("metadata->>type", "phase_change")
    .eq("metadata->>oldPhase", oldPhaseName)
    .eq("metadata->>newPhase", newPhaseName)
    .gte("created_at", fiveSecondsAgo);

  // Nur eine neue Notiz erstellen, wenn keine kürzlich erstellte existiert
  if (!existingNotes || existingNotes.length === 0) {
    const message = getPhaseChangeMessage(oldPhaseName, newPhaseName);
    
    const { error: noteError } = await supabase
      .from("notes")
      .insert({
        lead_id: leadId,
        user_id: userId,
        content: message.content, // Nur den Text ohne Emoji
        metadata: {
          type: 'phase_change',
          oldPhase: oldPhaseName,
          newPhase: newPhaseName,
          timestamp,
          emoji: message.emoji
        }
      });

    if (noteError) throw noteError;
  } else {
    console.log("Skipping note creation - similar note exists within last 5 seconds");
  }

  return { success: true };
};
