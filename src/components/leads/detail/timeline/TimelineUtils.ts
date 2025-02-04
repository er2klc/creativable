import { format } from "date-fns";
import { de } from "date-fns/locale";

export type TimelineItemType = 
  | 'note'
  | 'task'
  | 'appointment'
  | 'phase_change'
  | 'status_change'
  | 'message'
  | 'file_upload'
  | 'contact_created';

export interface TimelineItem {
  id: string;
  type: TimelineItemType;
  content: string;
  timestamp: string;
  created_at?: string;
  metadata?: {
    dueDate?: string;
    fileName?: string;
    fileType?: string;
    fileSize?: number;
    filePath?: string;
    status?: 'completed' | 'cancelled' | 'outdated';
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
  platform?: string;
  status?: string;
}

export const formatDate = (date: string) => {
  return format(new Date(date), 'PPp', { locale: de });
};