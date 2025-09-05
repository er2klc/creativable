import { TimelineItem } from "../TimelineUtils";

export const mapNoteToTimelineItem = (note: any): TimelineItem => {
  return {
    id: note.id,
    type: 'note',
    content: note.content,
    timestamp: note.created_at,
    metadata: note.metadata || {}
  };
};

export const mapTaskToTimelineItem = (task: any): TimelineItem => {
  const isAppointment = task.meeting_type || task.metadata?.meetingType;
  
  return {
    id: task.id,
    type: isAppointment ? 'appointment' : 'task',
    content: task.title,
    timestamp: task.created_at,
    completed: task.completed,
    status: task.cancelled ? 'cancelled' : task.completed ? 'completed' : 'pending',
    metadata: {
      dueDate: task.due_date,
      meetingType: task.meeting_type,
      color: task.color,
      status: task.cancelled ? 'cancelled' : task.completed ? 'completed' : 'pending',
      completedAt: task.completed_at,
      ...task.metadata
    }
  };
};

export const mapMessageToTimelineItem = (message: any): TimelineItem => {
  return {
    id: message.id,
    type: 'message',
    content: message.content,
    timestamp: message.created_at,
    platform: message.platform
  };
};

export const mapFileToTimelineItem = (file: any): TimelineItem => {
  return {
    id: file.id,
    type: 'file_upload',
    content: `Datei hochgeladen: ${file.file_name}`,
    timestamp: file.created_at,
    metadata: {
      fileName: file.file_name,
      fileType: file.mime_type,
      fileSize: file.file_size,
      filePath: file.file_path
    }
  };
};

export const mapBusinessMatchToTimelineItem = (businessMatch: any): TimelineItem => {
  return {
    id: businessMatch.id,
    type: 'business_match',
    content: `Business Match Analysis erstellt`,
    timestamp: businessMatch.created_at,
    metadata: {
      match_score: businessMatch.match_score,
      ...businessMatch.analysis_result
    }
  };
};

export const createContactCreationItem = (name: string, created_at: string): TimelineItem => {
  return {
    id: `contact-created-${created_at}`,
    type: 'contact_created',
    content: `Kontakt ${name} wurde erstellt`,
    timestamp: created_at
  };
};

export const createStatusChangeItem = (status: string, timestamp: string, name?: string): TimelineItem | null => {
  if (status === 'lead') return null;
  
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
    id: `status-${timestamp}`,
    type: 'status_change',
    content: statusMessage,
    timestamp,
    metadata: {
      newStatus: status
    }
  };
};

export const deduplicateTimelineItems = (items: TimelineItem[]): TimelineItem[] => {
  const seen = new Set<string>();
  const deduplicated = items.filter(item => {
    const key = `${item.type}-${item.timestamp}-${item.content.substring(0, 50)}`;
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });

  return deduplicated.sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
};