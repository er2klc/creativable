export type TimelineItemType = 
  | 'message'
  | 'task' 
  | 'note'
  | 'appointment'
  | 'file_upload'
  | 'contact_created'
  | 'phase_change';

export type TimelineItemStatus = 
  | 'completed' 
  | 'cancelled' 
  | 'pending'
  | 'outdated'
  | 'instagram'
  | 'linkedin'
  | 'whatsapp';

export interface TimelineItem {
  id: string;
  type: TimelineItemType;
  content: string;
  created_at: string;
  timestamp: string;
  status?: TimelineItemStatus;
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
    meetingType?: string;
    color?: string;
  };
}