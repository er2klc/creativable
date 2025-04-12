
import { TimelineItem, TimelineItemType } from "../TimelineUtils";
import { format } from "date-fns";

export const mapNoteToTimelineItem = (note: any): TimelineItem => {
  // Extract metadata if present
  let metadata: any = {};
  
  try {
    metadata = note.metadata || {};
  } catch (e) {
    console.error("Error parsing note metadata:", e);
  }

  // Determine type
  let type: TimelineItemType = "note";
  if (metadata && (metadata.type === "phase_analysis" || metadata.icon_type === "phase_analysis")) {
    type = "phase_analysis";
  }

  return {
    id: note.id,
    type,
    content: note.content,
    timestamp: note.created_at,
    metadata: {
      ...metadata,
      last_edited_at: note.updated_at,
      color: note.color,
    },
    created_at: note.created_at,
  };
};

export const mapTaskToTimelineItem = (task: any): TimelineItem => {
  return {
    id: task.id,
    type: "task",
    content: task.title || task.task, // Support both legacy and new format
    timestamp: task.created_at || task.due_date || new Date().toISOString(),
    completed: !!task.completed,
    status: task.completed ? "completed" : "pending",
    metadata: {
      dueDate: task.due_date,
      completedAt: task.completed_at,
      color: task.color,
      meetingType: task.meeting_type,
      priority: task.priority,
    },
    created_at: task.created_at,
  };
};

export const mapMessageToTimelineItem = (message: any): TimelineItem => {
  return {
    id: message.id,
    type: "message",
    content: message.content,
    timestamp: message.created_at || message.sent_at || new Date().toISOString(),
    platform: message.platform,
    metadata: {
      sender: message.sender, // This may be a user object
      receiver: message.receiver, // This may be a user object
    },
    created_at: message.created_at,
  };
};

export const mapFileToTimelineItem = (file: any): TimelineItem => {
  return {
    id: file.id,
    type: "file_upload",
    content: file.file_name,
    timestamp: file.created_at || new Date().toISOString(),
    metadata: {
      fileName: file.file_name,
      filePath: file.file_path,
      fileType: file.file_type,
      fileSize: file.file_size,
      content: file.file_name,
    },
    created_at: file.created_at,
  };
};

export const createContactCreationItem = (
  name: string,
  timestamp?: string
): TimelineItem => {
  const createdAt = timestamp || new Date().toISOString();
  return {
    id: `contact-creation-${createdAt}`,
    type: "contact_created",
    content: `Kontakt "${name}" erstellt`,
    timestamp: createdAt,
    metadata: {
      timestamp: createdAt,
    },
    created_at: createdAt,
  };
};

export const createStatusChangeItem = (
  status: string, 
  timestamp: string,
  name?: string
): TimelineItem | null => {
  if (status === "lead") return null; // No status change item for default lead status
  
  let statusMessage = '';
  let emoji = '';
  
  switch (status) {
    case 'partner':
      statusMessage = name 
        ? `${name} ist jetzt Partner! 🚀` 
        : `Kontakt ist jetzt Partner! 🚀`;
      emoji = '🚀';
      break;
    case 'customer':
      statusMessage = name 
        ? `${name} ist jetzt Kunde – viel Erfolg! 🎉` 
        : `Kontakt ist jetzt Kunde – viel Erfolg! 🎉`;
      emoji = '🎉';
      break;
    case 'not_for_now':
      statusMessage = name 
        ? `${name} ist aktuell nicht bereit – bleib dran! ⏳` 
        : `Kontakt ist aktuell nicht bereit – bleib dran! ⏳`;
      emoji = '⏳';
      break;
    case 'no_interest':
      statusMessage = name 
        ? `${name} hat kein Interesse – weiter geht's! 🚀` 
        : `Kontakt hat kein Interesse – weiter geht's! 🚀`;
      emoji = '🚀';
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
      timestamp,
      emoji
    },
    created_at: timestamp,
  };
};
