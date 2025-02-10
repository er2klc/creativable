
import { LeadWithRelations } from "@/types/leads";

export interface TimelineItem {
  id: string;
  type: string;
  content: string;
  timestamp: string;
  metadata?: {
    dueDate?: string;
    fileName?: string;
    fileType?: string;
    fileSize?: number;
    filePath?: string;
    status?: "completed" | "cancelled" | "outdated";
    completedAt?: string;
    cancelledAt?: string;
    updatedAt?: string;
    oldDate?: string;
    newDate?: string;
    type?: string;
    oldStatus?: string;
    newStatus?: string;
    last_edited_at?: string;
    meetingType?: string;
    color?: string;
  };
  created_at?: string;
}

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
    type: 'status_change',
    content: statusMessage,
    timestamp: lead.updated_at || new Date().toISOString(),
    metadata: {
      oldStatus: lead.status,
      newStatus: lead.status,
      timestamp: lead.updated_at || new Date().toISOString()
    }
  };
};
