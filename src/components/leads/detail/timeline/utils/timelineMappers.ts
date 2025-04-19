
import { TimelineItem } from "../TimelineUtils";

export const mapNoteToTimelineItem = (note: any): TimelineItem => ({
  id: note.id,
  type: 'note',
  content: note.content,
  timestamp: note.created_at,
  created_at: note.created_at,
  metadata: {
    last_edited_at: note.updated_at,
    type: note.type
  }
});

export const mapTaskToTimelineItem = (task: any): TimelineItem => ({
  id: task.id,
  type: 'task',
  content: task.title,
  timestamp: task.due_date || task.created_at,
  completed: task.completed,
  status: task.completed ? 'completed' : 'pending',
  created_at: task.created_at,
  metadata: {
    dueDate: task.due_date,
    completedAt: task.completed_at,
    status: task.completed ? 'completed' : 'pending'
  }
});

export const mapMessageToTimelineItem = (message: any): TimelineItem => ({
  id: message.id,
  type: 'message',
  content: message.content,
  timestamp: message.created_at,
  created_at: message.created_at,
  metadata: {
    type: message.type,
    platform: message.platform
  }
});

export const mapFileToTimelineItem = (file: any): TimelineItem => ({
  id: file.id,
  type: 'file_upload',
  content: file.file_name,
  timestamp: file.created_at,
  created_at: file.created_at,
  metadata: {
    fileName: file.file_name,
    filePath: file.file_path,
    fileType: file.file_type,
    fileSize: file.file_size
  }
});

export const mapBusinessMatchToTimelineItem = (match: any): TimelineItem => ({
  id: match.id || `business-match-${Date.now()}`,
  type: 'business_match',
  content: match.content || 'Business Match Analysis',
  timestamp: match.created_at || new Date().toISOString(),
  metadata: {
    match_score: match.match_score || 0,
    skills: match.skills || [],
    commonalities: match.commonalities || [],
    potential_needs: match.potential_needs || [],
    strengths: match.strengths || [],
    content: match.content || ''
  }
});

export const createContactCreationItem = (name: string, created_at: string): TimelineItem => ({
  id: `contact-creation-${Date.now()}`,
  type: 'contact_created',
  content: `Kontakt "${name}" wurde erstellt`,
  timestamp: created_at,
  metadata: {
    emoji: '👋'
  }
});

export const createStatusChangeItem = (
  status: string, 
  timestamp: string,
  name?: string
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
