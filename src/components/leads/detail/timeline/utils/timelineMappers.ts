import { TimelineItem } from "../TimelineUtils";

export const mapNoteToTimelineItem = (note: any): TimelineItem => ({
  id: note.id,
  type: note.metadata?.type === 'phase_change' ? 'phase_change' : 'note',
  content: note.content,
  created_at: note.created_at,
  timestamp: note.created_at,
  metadata: note.metadata,
  status: note.status
});

export const mapTaskToTimelineItem = (task: any): TimelineItem => ({
  id: task.id,
  type: 'task',
  content: task.title,
  created_at: task.created_at,
  timestamp: task.created_at,
  metadata: {
    dueDate: task.due_date,
    status: task.completed ? 'completed' : task.cancelled ? 'cancelled' : undefined,
    completedAt: task.completed ? task.updated_at : undefined,
    color: task.color,
    meetingType: task.meeting_type
  }
});

export const mapMessageToTimelineItem = (message: any): TimelineItem => ({
  id: message.id,
  type: 'message',
  content: message.content,
  created_at: message.created_at,
  timestamp: message.sent_at || message.created_at,
  platform: message.platform,
  metadata: {
    type: message.platform
  }
});

export const mapFileToTimelineItem = (file: any): TimelineItem => ({
  id: file.id,
  type: 'file_upload',
  content: file.file_name,
  created_at: file.created_at,
  timestamp: file.created_at,
  metadata: {
    fileName: file.file_name,
    filePath: file.file_path,
    fileType: file.file_type,
    fileSize: file.file_size
  }
});

export const createContactCreationItem = (name: string, created_at: string): TimelineItem => ({
  id: `contact-creation-${created_at}`,
  type: 'contact_created',
  content: `Kontakt ${name} wurde erstellt`,
  created_at: created_at,
  timestamp: created_at,
  metadata: {
    type: 'contact_created'
  }
});

export const createStatusChangeItem = (status: string, timestamp: string, oldStatus?: string): TimelineItem | null => {
  // Don't create timeline item for 'lead' status
  if (status === 'lead') return null;

  return {
    id: `status-${timestamp}`,
    type: 'status_change',
    content: `Status geändert zu ${status}`,
    timestamp: timestamp,
    metadata: {
      type: 'status_change',
      oldStatus,
      newStatus: status,
      timestamp
    }
  };
};