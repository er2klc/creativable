
import { Tables } from "@/integrations/supabase/types";
import { TimelineItem } from "../TimelineUtils";

export const mapNoteToTimelineItem = (note: Tables<"notes">): TimelineItem => {
  return {
    id: note.id,
    type: "note",
    content: note.content,
    timestamp: note.created_at || new Date().toISOString(),
    metadata: {
      type: note.type,
      last_edited_at: note.updated_at,
      ...note.metadata
    },
    created_at: note.created_at,
  };
};

export const mapTaskToTimelineItem = (task: Tables<"tasks">): TimelineItem => {
  return {
    id: task.id,
    type: "task",
    content: task.title,
    timestamp: task.created_at || new Date().toISOString(),
    completed: task.completed,
    status: task.completed ? "completed" : "open",
    metadata: {
      dueDate: task.due_date,
      status: task.completed ? "completed" : undefined,
      completedAt: task.completed ? task.updated_at : undefined,
      priority: task.priority,
      type: "task"
    },
    created_at: task.created_at,
  };
};

export const mapMessageToTimelineItem = (message: Tables<"messages">): TimelineItem => {
  return {
    id: message.id,
    type: "message",
    content: message.content,
    timestamp: message.sent_at || message.created_at || new Date().toISOString(),
    platform: message.platform,
    metadata: {
      sender: message.sender || undefined,
      receiver: message.receiver || undefined,
      type: "message"
    },
    created_at: message.created_at,
  };
};

export const mapFileToTimelineItem = (file: Tables<"lead_files">): TimelineItem => {
  return {
    id: file.id,
    type: "file_upload",
    content: file.file_name || "Uploaded file",
    timestamp: file.created_at || new Date().toISOString(),
    metadata: {
      fileName: file.file_name,
      fileType: file.file_type,
      fileSize: file.file_size,
      filePath: file.file_path,
      type: "file"
    },
    created_at: file.created_at,
  };
};

export const mapBusinessMatchToTimelineItem = (match: any): TimelineItem => {
  return {
    id: match.id || `match-${Date.now()}`,
    type: "business_match",
    content: "Business Match Analysis",
    timestamp: match.created_at || new Date().toISOString(),
    metadata: {
      match_score: match.match_score || 0,
      skills: match.skills || [],
      commonalities: match.commonalities || [],
      potential_needs: match.potential_needs || [],
      strengths: match.strengths || [],
      content: match.content || '',
      type: "business_match"
    },
    created_at: match.created_at,
  };
};

export const createContactCreationItem = (name: string, timestamp: string): TimelineItem => {
  return {
    id: `creation-${Date.now()}`,
    type: "contact_created",
    content: `Kontakt ${name} erstellt`,
    timestamp: timestamp || new Date().toISOString(),
    metadata: {
      type: "system"
    }
  };
};

export const createStatusChangeItem = (
  status: string, 
  timestamp: string,
  name?: string
): TimelineItem => {
  let statusMessage = '';
  
  switch (status) {
    case 'partner':
      statusMessage = `Kontakt${name ? ' ' + name : ''} ist jetzt dein Partner! 🚀`;
      break;
    case 'customer':
      statusMessage = `Kontakt${name ? ' ' + name : ''} ist jetzt Kunde – viel Erfolg! 🎉`;
      break;
    case 'not_for_now':
      statusMessage = `Kontakt${name ? ' ' + name : ''} ist aktuell nicht bereit – bleib dran! ⏳`;
      break;
    case 'no_interest':
      statusMessage = `Kontakt${name ? ' ' + name : ''} hat kein Interesse – weiter geht's! 🚀`;
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
