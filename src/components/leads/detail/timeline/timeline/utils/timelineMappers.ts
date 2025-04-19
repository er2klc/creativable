
import { v4 as uuidv4 } from "uuid";
import { TimelineItem } from "../../TimelineUtils";
import { Tables } from "@/integrations/supabase/types";

export const createContactCreationItem = (name: string, timestamp: string): TimelineItem => {
  return {
    id: `creation-${uuidv4()}`,
    type: "contact_created",
    content: `${name} wurde als Kontakt erstellt`,
    timestamp: timestamp || new Date().toISOString(),
    metadata: {
      emoji: "👋"
    }
  };
};

export const createStatusChangeItem = (status: string, timestamp: string, name: string): TimelineItem | null => {
  if (!status || status === "lead") return null;

  const emoji = status === "partner" ? "🤝" : 
               status === "customer" ? "💰" : 
               status === "not_for_now" ? "⏱️" : "🚫";

  const statusText = status === "partner" ? "Partner" : 
                    status === "customer" ? "Kunde" : 
                    status === "not_for_now" ? "Not For Now" : 
                    status === "no_interest" ? "Kein Interesse" : status;

  return {
    id: `status-${uuidv4()}`,
    type: "status_change",
    content: `${name} ist jetzt ${statusText}`,
    timestamp: timestamp,
    metadata: {
      newStatus: status,
      oldStatus: "lead",
      emoji: emoji,
      timestamp: timestamp
    }
  };
};

export const mapNoteToTimelineItem = (note: Tables<"notes">): TimelineItem => {
  return {
    id: note.id,
    type: "note",
    content: note.content,
    timestamp: note.created_at,
    metadata: note.metadata,
    created_at: note.created_at
  };
};

export const mapTaskToTimelineItem = (task: Tables<"tasks">): TimelineItem => {
  return {
    id: task.id,
    type: "task",
    content: task.title,
    completed: task.completed,
    timestamp: task.due_date || task.created_at,
    metadata: {
      dueDate: task.due_date,
      description: task.description
    },
    created_at: task.created_at
  };
};

export const mapMessageToTimelineItem = (message: Tables<"messages">): TimelineItem => {
  return {
    id: message.id,
    type: "message",
    content: message.content,
    timestamp: message.created_at,
    platform: message.channel,
    created_at: message.created_at
  };
};

export const mapFileToTimelineItem = (file: Tables<"lead_files">): TimelineItem => {
  return {
    id: file.id,
    type: "file_upload",
    content: file.title || file.file_name,
    timestamp: file.created_at,
    metadata: {
      fileName: file.file_name,
      fileType: file.file_type,
      fileSize: file.file_size,
      filePath: file.file_path
    },
    created_at: file.created_at
  };
};
