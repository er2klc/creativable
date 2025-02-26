
import { supabase } from "@/integrations/supabase/client";

const getPhaseChangeMessage = (
  oldPhaseName: string | null, 
  newPhaseName: string
): { content: string; emoji: string } => {
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

  const emoji = phaseEmojis[newPhaseName] || "✨";

  return {
    content: `Kontakt ist jetzt in Phase "${newPhaseName}"`,
    emoji
  };
};

const generateUniqueId = (leadId: string, oldPhase: string, newPhase: string): string => {
  const timestamp = Date.now();
  const array = new Uint8Array(4);
  window.crypto.getRandomValues(array);
  const random = Array.from(array).map(b => b.toString(16).padStart(2, '0')).join('');
  return `${leadId}-${timestamp}-${random}`;
};

export const updateLeadPhase = async (
  leadId: string,
  phaseId: string,
  oldPhaseName: string,
  newPhaseName: string,
  userId: string
) => {
  const timestamp = new Date().toISOString();
  console.log('Starting phase update transaction:', { leadId, phaseId, oldPhaseName, newPhaseName, timestamp });

  try {
    // Start a transaction by checking current state
    const { data: currentLead, error: checkError } = await supabase
      .from("leads")
      .select("phase_id")
      .eq("id", leadId)
      .single();

    if (checkError) throw checkError;

    // If the phase hasn't changed, return early
    if (currentLead?.phase_id === phaseId) {
      console.log("Phase unchanged, skipping update");
      return { success: true, unchanged: true };
    }

    // Generate unique IDs and metadata for tracking
    const transactionId = generateUniqueId(leadId, oldPhaseName, newPhaseName);
    const message = getPhaseChangeMessage(oldPhaseName, newPhaseName);
    
    console.log('Starting database transaction with ID:', transactionId);

    // Update lead phase
    const { error: updateError } = await supabase
      .from("leads")
      .update({
        phase_id: phaseId,
        last_action: "Phase changed",
        last_action_date: timestamp,
      })
      .eq("id", leadId);

    if (updateError) {
      console.error("Error updating lead phase:", updateError);
      throw updateError;
    }

    console.log('Lead phase updated successfully, creating note...');

    // Create phase change note with extended metadata
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
          transactionId,
          version: '2',
          source: 'kanban'
        }
      });

    if (noteError) {
      console.error("Error creating phase change note:", noteError);
      throw noteError;
    }

    console.log('Phase change transaction completed successfully:', {
      transactionId,
      leadId,
      oldPhase: oldPhaseName,
      newPhase: newPhaseName,
      timestamp
    });

    return {
      success: true,
      metadata: {
        transactionId,
        timestamp,
        phaseChange: {
          from: oldPhaseName,
          to: newPhaseName
        }
      }
    };

  } catch (error) {
    console.error("Error in phase update transaction:", error);
    throw error;
  }
};

