import { format } from "date-fns";
import { de } from "date-fns/locale";

export type TimelineItemType = 'task' | 'note' | 'appointment' | 'phase_change' | 'message';

export interface TimelineItem {
  id: string;
  type: TimelineItemType;
  content: string;
  created_at: string;
  platform?: string;
  metadata?: {
    dueDate?: string;
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

export const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const weekday = format(date, "EEE", { locale: de });
  return `${weekday}. ${format(date, "dd.MM.yyyy | HH:mm 'Uhr'", { locale: de })}`;
};