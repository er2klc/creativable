
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
  };
  created_at?: string;
}
