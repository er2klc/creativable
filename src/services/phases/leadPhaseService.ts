
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

  // Einheitlicher Text für alle Phasenänderungen
  return {
    content: `Kontakt ist jetzt in Phase "${newPhaseName}"`,
    emoji
  };
};

const generateUniqueId = (leadId: string, timestamp: string, oldPhase: string, newPhase: string): string => {
  const rand = Math.random().toString(36).substring(2, 8);
  return `${leadId}-${timestamp}-${oldPhase}-${newPhase}-${rand}`;
};

export const updateLeadPhase = async (
  leadId: string,
  phaseId: string,
  oldPhaseName: string,
  newPhaseName: string,
  userId: string
) => {
  const timestamp = new Date().toISOString();

  try {
    // Erst prüfen ob sich die Phase tatsächlich geändert hat!
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

    // Eine neue Notiz für die Phasenänderung erstellen
    const message = getPhaseChangeMessage(oldPhaseName, newPhaseName);
    const uniqueId = generateUniqueId(leadId, timestamp, oldPhaseName, newPhaseName);
    
    const { error: noteError } = await supabase
      .from("notes")
      .insert({
        lead_id: leadId,
        user_id: userId,
        content: message.content,
        metadata: {
          type: 'phase_change',
          oldPhase: oldPhaseName,
          newPhase: newPhaseName,
          timestamp,
          emoji: message.emoji,
          unique_id: uniqueId
        }
      });

    if (noteError) throw noteError;

    return { success: true };
  } catch (error) {
    console.error("Error updating lead phase:", error);
    throw error;
  }
};
