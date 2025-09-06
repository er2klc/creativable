import { Tables } from "@/integrations/supabase/types";

export interface TimelineItem {
  id: string;
  type: string;
  content: string;
  timestamp: string;
  metadata?: any;
  status?: string;
  isCompleted?: boolean;
}

export const mapNoteToTimelineItem = (note: Tables<"notes">): TimelineItem => ({
  id: note.id,
  type: 'note',
  content: note.content,
  timestamp: note.created_at || new Date().toISOString(),
  metadata: note.metadata
});

export const mapTaskToTimelineItem = (task: Tables<"tasks">): TimelineItem => ({
  id: task.id,
  type: 'task',
  content: task.title,
  timestamp: task.created_at || new Date().toISOString(),
  metadata: {
    dueDate: task.due_date,
    status: task.completed ? 'completed' : 'pending'
  },
  isCompleted: task.completed,
  status: task.completed ? 'completed' : 'pending'
});

export const mapMessageToTimelineItem = (message: Tables<"messages">): TimelineItem => ({
  id: message.id,
  type: 'message',
  content: message.content,
  timestamp: message.created_at || new Date().toISOString(),
  metadata: {
    type: 'message'
  }
});

export const mapFileToTimelineItem = (file: Tables<"lead_files">): TimelineItem => ({
  id: file.id,
  type: 'file_upload',
  content: `File uploaded: ${file.file_name}`,
  timestamp: file.created_at || new Date().toISOString(),
  metadata: {
    fileName: file.file_name,
    filePath: file.file_path,
    fileType: file.file_type || 'unknown'
  }
});

export const mapBusinessMatchToTimelineItem = (businessMatch: any): TimelineItem => ({
  id: `business_match_${Date.now()}`,
  type: 'business_match',
  content: 'Business match analysis completed',
  timestamp: new Date().toISOString(),
  metadata: {
    type: 'business_match',
    ...businessMatch
  }
});

export const createContactCreationItem = (name: string, createdAt?: string): TimelineItem => ({
  id: `contact_created_${Date.now()}`,
  type: 'contact_created',
  content: `Contact "${name}" was created`,
  timestamp: createdAt || new Date().toISOString(),
  metadata: {
    type: 'contact_created',
    emoji: '👤'
  }
});

export const createStatusChangeItem = (oldStatus: string, newStatus: string, timestamp?: string): TimelineItem => ({
  id: `status_change_${Date.now()}`,
  type: 'status_change',
  content: `Status changed from ${oldStatus} to ${newStatus}`,
  timestamp: timestamp || new Date().toISOString(),
  metadata: {
    type: 'status_change',
    oldStatus,
    newStatus,
    emoji: '📊'
  }
});