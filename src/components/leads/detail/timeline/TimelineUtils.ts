import { format } from "date-fns";
import { de } from "date-fns/locale";

export const formatDate = (date: string) => {
  const weekday = format(new Date(date), "EEE", { locale: de });
  const formattedDate = format(new Date(date), "dd.MM.yyyy | HH:mm 'Uhr'", { locale: de });
  return `${weekday}. ${formattedDate}`;
};

export type TimelineItemType = 
  | "message" 
  | "task" 
  | "note" 
  | "phase_change" 
  | "reminder" 
  | "upload" 
  | "contact_created" 
  | "appointment"
  | "presentation"
  | "file_upload";

export interface TimelineItem {
  id: string;
  type: TimelineItemType;
  content: string;
  timestamp: string;
  status?: string;
  platform?: string;
  metadata?: {
    dueDate?: string;
    meetingType?: string;
    color?: string;
    oldPhase?: string;
    newPhase?: string;
    fileName?: string;
    fileType?: string;
    fileSize?: number;
    status?: 'completed' | 'cancelled' | 'outdated';
    completedAt?: string;
    cancelledAt?: string;
    updatedAt?: string;
    oldDate?: string;
    newDate?: string;
  };
}