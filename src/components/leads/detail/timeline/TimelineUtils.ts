
export type TimelineItemType = 
  | 'message'
  | 'task' 
  | 'appointment'
  | 'note'
  | 'phase_change'
  | 'status_change'
  | 'contact_created'
  | 'file_upload'
  | string;

export interface TimelineItem {
  id: string;
  type: TimelineItemType;
  content: string;
  timestamp: string;
  platform?: string;
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
    oldStatus?: string;
    newStatus?: string;
    oldPhase?: string;
    newPhase?: string;
    last_edited_at?: string;
    sender?: string;
    receiver?: string;
    due_date?: string;
    completed_at?: string;
  };
}

// Helper function to format a date
export const formatDate = (date: string | Date): string => {
  if (!date) return '';
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString();
};

// This function creates a timeline item for a status change
export const createStatusChangeItem = (
  status: string, 
  timestamp: string
): TimelineItem => {
  let statusMessage = '';
  
  switch (status) {
    case 'partner':
      statusMessage = `Contact is now your partner! 🚀`;
      break;
    case 'customer':
      statusMessage = `Contact is now a customer – success! 🎉`;
      break;
    case 'not_for_now':
      statusMessage = `Contact is not ready at the moment – keep in touch! ⏳`;
      break;
    case 'no_interest':
      statusMessage = `Contact has no interest – move forward! 🚀`;
      break;
    default:
      statusMessage = `Status changed to ${status}`;
  }

  return {
    id: `status-${Date.now()}`,
    type: 'status_change',
    content: statusMessage,
    timestamp,
    metadata: {
      oldStatus: 'lead',
      newStatus: status,
    }
  };
};
