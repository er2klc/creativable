import { LeadWithRelations } from "@/types/leads";
import { TimelineItem } from "./TimelineItem";

export const createStatusChangeItem = (lead: LeadWithRelations): TimelineItem => {
  let statusMessage = '';
  const name = lead.name;

  switch (lead.status) {
    case 'partner':
      statusMessage = `${name} ist jetzt dein neuer Partner! 🚀`;
      break;
    case 'customer':
      statusMessage = `${name} ist jetzt Kunde – viel Erfolg! 🎉`;
      break;
    case 'not_for_now':
      statusMessage = `${name} ist aktuell nicht bereit – bleib dran! ⏳`;
      break;
    case 'no_interest':
      statusMessage = `${name} hat kein Interesse – weiter geht's! 🚀`;
      break;
    default:
      statusMessage = `Status geändert zu ${lead.status}`;
  }

  return {
    id: `status-${lead.id}`,
    type: 'phase_change',
    content: statusMessage,
    timestamp: lead.updated_at,
    metadata: {
      oldStatus: lead.status,
      newStatus: lead.status,
    }
  };
};
