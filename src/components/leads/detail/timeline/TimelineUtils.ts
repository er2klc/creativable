import { format } from "date-fns";
import { de } from "date-fns/locale";

export type TimelineItemType = 
  | 'task' 
  | 'note' 
  | 'appointment' 
  | 'phase_change' 
  | 'message' 
  | 'file_upload'
  | 'contact_created'
  | 'reminder'
  | 'upload'
  | 'presentation';

export type TimelineItemStatus = 'completed' | 'cancelled' | 'outdated';

export interface TimelineItem {
  id: string;
  type: TimelineItemType;
  content: string;
  created_at: string;
  timestamp: string;
  status?: string;
  platform?: string;
  metadata?: {
    dueDate?: string;
    fileName?: string;
    fileType?: string;
    fileSize?: number;
    filePath?: string;
    status?: TimelineItemStatus;
    completedAt?: string;
    cancelledAt?: string;
    updatedAt?: string;
    oldDate?: string;
    newDate?: string;
    oldPhase?: string;
    newPhase?: string;
    color?: string;
    meetingType?: string;
  };
}

export const formatDate = (dateString: string) => {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return "Ungültiges Datum";
    }
    const weekday = format(date, "EEE", { locale: de });
    return `${weekday}. ${format(date, "dd.MM.yyyy | HH:mm 'Uhr'", { locale: de })}`;
  } catch (error) {
    return "Ungültiges Datum";
  }
};