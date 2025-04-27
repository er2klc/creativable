
import { format } from "date-fns";
import { de } from "date-fns/locale";

interface TimelineItem {
  id: string;
  title: string;
  content: string;
  timestamp: string;
  type: string;
  metadata?: any;
  status?: string;
  icon?: string;
  iconColor?: string;
}

export const mapNoteToTimelineItem = (note: any): TimelineItem => {
  return {
    id: note.id,
    title: "Notiz",
    content: note.content,
    timestamp: note.created_at,
    type: "note",
    metadata: note.metadata || {},
    iconColor: note.icon_color,
    icon: note.icon_type,
  };
};

export const mapTaskToTimelineItem = (task: any): TimelineItem => {
  return {
    id: task.id,
    title: task.title || "Aufgabe",
    content: task.description || "",
    timestamp: task.created_at,
    type: "task",
    status: task.completed ? "completed" : "pending",
    metadata: {
      dueDate: task.due_date,
      priority: task.priority,
      completed: task.completed,
    },
  };
};

export const mapMessageToTimelineItem = (message: any): TimelineItem => {
  return {
    id: message.id,
    title: "Nachricht",
    content: message.content,
    timestamp: message.created_at || message.sent_at,
    type: "message",
    metadata: {
      platform: message.platform,
    },
  };
};

export const mapFileToTimelineItem = (file: any): TimelineItem => {
  return {
    id: file.id,
    title: file.file_name || "Datei",
    content: file.description || "",
    timestamp: file.created_at,
    type: "file",
    metadata: {
      fileName: file.file_name,
      fileType: file.file_type,
      filePath: file.file_path,
      fileSize: file.file_size,
    },
  };
};

export const createContactCreationItem = (name: string, createdAt: string): TimelineItem => {
  return {
    id: `creation-${createdAt}`,
    title: "Kontakt erstellt",
    content: `Kontakt "${name}" wurde erstellt.`,
    timestamp: createdAt,
    type: "contact_creation",
    icon: "user-plus",
    iconColor: "#4CAF50",
  };
};

export const createStatusChangeItem = (status: string, timestamp: string, name: string): TimelineItem | null => {
  if (status === 'lead') return null;
  
  const statusMap: Record<string, { title: string, icon: string, color: string }> = {
    'customer': { 
      title: "Kunde", 
      icon: "user-check", 
      color: "#4CAF50" 
    },
    'partner': { 
      title: "Partner", 
      icon: "handshake", 
      color: "#2196F3" 
    },
    'not_for_now': { 
      title: "Später", 
      icon: "clock", 
      color: "#FF9800" 
    },
    'no_interest': { 
      title: "Kein Interesse", 
      icon: "x", 
      color: "#F44336" 
    },
  };
  
  const statusInfo = statusMap[status] || { 
    title: "Status geändert", 
    icon: "refresh-cw", 
    color: "#9C27B0" 
  };
  
  const formattedDate = format(new Date(timestamp), "dd. MMMM yyyy", { locale: de });
  
  return {
    id: `status-${status}-${timestamp}`,
    title: `Status: ${statusInfo.title}`,
    content: `${name} wurde am ${formattedDate} als "${statusInfo.title}" markiert.`,
    timestamp: timestamp,
    type: "status_change",
    icon: statusInfo.icon,
    iconColor: statusInfo.color,
    metadata: {
      status: status,
    }
  };
};
