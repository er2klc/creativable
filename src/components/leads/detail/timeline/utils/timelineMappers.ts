
import { LeadWithRelations } from "@/types/leads";

export interface TimelineItem {
  id: string;
  type: string;
  content: string;
  timestamp: string;
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
    type?: string;
    oldStatus?: string;
    newStatus?: string;
    last_edited_at?: string;
    meetingType?: string;
    color?: string;
    oldPhase?: string;
    newPhase?: string;
    emoji?: string;
    unique_id?: string;
  };
  created_at?: string;
}

export const mapNoteToTimelineItem = (note: any): TimelineItem => {
  // Special handling for phase change notes
  if (note.metadata?.type === 'phase_change') {
    return {
      id: note.id,
      type: 'phase_change',
      content: note.content,
      timestamp: note.metadata?.timestamp || note.created_at,
      metadata: {
        ...note.metadata,
        oldPhase: note.metadata?.oldPhase,
        newPhase: note.metadata?.newPhase,
        emoji: note.metadata?.emoji || "✨",
        unique_id: note.metadata?.unique_id
      },
      created_at: note.created_at
    };
  }

  return {
    id: note.id,
    type: note.metadata?.type === 'phase_change' ? 'phase_change' : 'note',
    content: note.content,
    timestamp: note.metadata?.timestamp || note.created_at,
    metadata: note.metadata,
    created_at: note.created_at
  };
};

export const mapTaskToTimelineItem = (task: any): TimelineItem => ({
  id: task.id,
  type: task.type || 'task',
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

export const createStatusChangeItem = (
  status: string, 
  timestamp: string,
  name?: string
): TimelineItem | null => {
  if (status === 'lead') return null;

  let content = '';
  switch (status) {
    case 'partner':
      content = `${name || 'Kontakt'} ist jetzt dein neuer Partner! 🚀`;
      break;
    case 'customer':
      content = `${name || 'Kontakt'} ist jetzt Kunde – viel Erfolg! 🎉`;
      break;
    case 'not_for_now':
      content = `${name || 'Kontakt'} ist aktuell nicht bereit – bleib dran! ⏳`;
      break;
    case 'no_interest':
      content = `${name || 'Kontakt'} hat kein Interesse – weiter geht's! 🚀`;
      break;
    default:
      content = `Status geändert zu ${status}`;
  }

  return {
    id: `status-${timestamp}`,
    type: 'status_change',
    content,
    timestamp,
    metadata: {
      type: 'status_change',
      newStatus: status,
      timestamp
    }
  };
};

export const deduplicateTimelineItems = (items: TimelineItem[]): TimelineItem[] => {
  const uniqueItems = new Map<string, TimelineItem>();
  
  items.forEach(item => {
    // Für Phasenänderungen einen spezifischen Schlüssel erstellen
    const key = item.type === 'phase_change' 
      ? `${item.metadata?.oldPhase}-${item.metadata?.newPhase}-${item.metadata?.unique_id}`
      : item.id;
      
    const existingItem = uniqueItems.get(key);
    
    if (!existingItem || new Date(item.timestamp) > new Date(existingItem.timestamp)) {
      uniqueItems.set(key, item);
    }
  });

  return Array.from(uniqueItems.values()).sort((a, b) => {
    const dateA = new Date(a.timestamp || a.created_at || '');
    const dateB = new Date(b.timestamp || b.created_at || '');
    return dateB.getTime() - dateA.getTime();
  });
};
