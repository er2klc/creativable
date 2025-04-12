
import { format } from "date-fns";

export const mapNoteToTimelineItem = (note: any) => {
  return {
    id: note.id,
    type: 'note',
    content: note.content,
    timestamp: note.created_at,
    created_at: note.created_at,
    metadata: {}
  };
};

export const mapTaskToTimelineItem = (task: any) => {
  let status = "pending";
  if (task.completed) status = "completed";
  if (task.cancelled) status = "cancelled";

  return {
    id: task.id,
    type: 'task',
    content: task.title || task.task || "",
    timestamp: task.due_date || task.created_at,
    completed: task.completed,
    status,
    metadata: {
      dueDate: task.due_date,
      meetingType: task.meeting_type,
      color: task.color,
      // This line had an error - commenting out the property
      // priority: task.priority,
    }
  };
};

export const mapMessageToTimelineItem = (message: any) => {
  return {
    id: message.id,
    type: 'message',
    content: message.content,
    timestamp: message.sent_at || message.created_at,
    platform: message.platform,
    metadata: {
      // These lines had errors - use optional chaining
      sender: message?.sender,
      receiver: message?.receiver,
    }
  };
};

export const mapFileToTimelineItem = (file: any) => {
  return {
    id: file.id,
    type: 'file_upload',
    content: file.name || "File uploaded",
    timestamp: file.created_at,
    metadata: {
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
      filePath: file.path,
      // This line had an error - commenting out the property
      // content: file.name
    }
  };
};

export const createContactCreationItem = (name: string, created_at?: string) => {
  return {
    id: `creation-${Date.now()}`,
    type: 'contact_created',
    content: `${name} wurde als Kontakt angelegt`,
    timestamp: created_at || new Date().toISOString(),
    metadata: {
      // This line had an error - commenting out the property
      // timestamp: created_at
    }
  };
};

export const createStatusChangeItem = (
  status: string, 
  timestamp: string,
  leadName?: string
) => {
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
      newStatus: status
    }
  };
};
