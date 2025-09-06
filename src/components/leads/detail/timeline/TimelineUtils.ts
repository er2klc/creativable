
import { LeadWithRelations } from "@/types/leads";

export type TimelineItemType = 
  | 'contact_created'
  | 'message'
  | 'task' 
  | 'appointment'
  | 'note'
  | 'phase_change'
  | 'status_change'
  | 'reminder'
  | 'presentation'
  | 'upload'
  | 'file_upload'
  | 'business_match'
  | string;

export interface TimelineItem {
  id: string;
  type: TimelineItemType;
  content: string;
  timestamp: string;
  platform?: string;
  completed?: boolean;
  status?: string;
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
    event_type?: string;
    match_score?: number;
    skills?: string[];
    commonalities?: string[];
    potential_needs?: string[];
    strengths?: string[];
    timestamp?: string;
    duration?: number;
    content?: string;
    oldPhase?: string;
    newPhase?: string;
  };
  created_at?: string;
}

export const createStatusChangeItem = (
  status: string, 
  timestamp: string
): TimelineItem => {
  let statusMessage = '';
  
  switch (status) {
    case 'partner':
      statusMessage = `Kontakt ist jetzt dein Partner! 🚀`;
      break;
    case 'customer':
      statusMessage = `Kontakt ist jetzt Kunde – viel Erfolg! 🎉`;
      break;
    case 'not_for_now':
      statusMessage = `Kontakt ist aktuell nicht bereit – bleib dran! ⏳`;
      break;
    case 'no_interest':
      statusMessage = `Kontakt hat kein Interesse – weiter geht's! 🚀`;
      break;
    default:
      statusMessage = `Status geändert zu ${status}`;
  }

  return {
    id: `status-${Date.now()}`,
    type: 'status_change',
    content: statusMessage,
    timestamp,
    metadata: {
      oldStatus: 'lead',
      newStatus: status,
      timestamp
    }
  };
};
