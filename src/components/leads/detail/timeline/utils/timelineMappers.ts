
import { TimelineItem, TimelineItemType } from "../TimelineUtils";
import { SocialMediaPost } from "../hooks/useSocialMediaPosts";

// Map social media posts to timeline items
export const mapSocialMediaPostsToTimelineItems = (posts: SocialMediaPost[]): TimelineItem[] => {
  return posts.map(post => ({
    id: post.id,
    type: post.platform.toLowerCase() as TimelineItemType,
    content: post.post_content || "",
    timestamp: post.post_date,
    platform: post.platform,
    metadata: {
      postUrl: post.post_url,
      postType: post.post_type,
      likes: post.likes,
      comments: post.comments,
      location: post.location,
      ...post.metadata
    }
  }));
};

// Map tasks to timeline items
export const mapTasksToTimelineItems = (tasks: any[]): TimelineItem[] => {
  return tasks.map(task => ({
    id: task.id,
    type: "task",
    content: task.title || task.content || "",
    timestamp: task.created_at,
    status: task.completed ? "completed" : "open",
    metadata: {
      dueDate: task.due_date,
      completedAt: task.completed_at,
      status: task.completed ? "completed" : task.cancelled ? "cancelled" : "open",
      priority: task.priority
    }
  }));
};

// Map notes to timeline items
export const mapNotesToTimelineItems = (tasks: any[]): TimelineItem[] => {
  return tasks.map(note => {
    // Check if this is a YouTube note
    if (note.metadata?.type === 'youtube') {
      return {
        id: note.id,
        type: "youtube",
        content: note.content || "",
        timestamp: note.created_at,
        metadata: note.metadata
      };
    }
    
    return {
      id: note.id,
      type: "note",
      content: note.content || "",
      timestamp: note.created_at,
      metadata: {
        type: note.metadata?.type,
        updatedAt: note.updated_at,
        lastEditedAt: note.updated_at,
        ...note.metadata
      }
    };
  });
};

// Map notes to timeline items specifically for the view
export const mapNoteToTimelineItem = (note: any): TimelineItem => {
  // Check if this is a YouTube note
  if (note.metadata?.type === 'youtube') {
    return {
      id: note.id,
      type: "youtube",
      content: note.content || "",
      timestamp: note.created_at,
      metadata: note.metadata
    };
  }
  
  return {
    id: note.id,
    type: "note",
    content: note.content || "",
    timestamp: note.created_at,
    metadata: {
      ...note.metadata,
      lastEditedAt: note.updated_at,
    }
  };
};

// Map tasks to timeline items specifically for the view
export const mapTaskToTimelineItem = (task: any): TimelineItem => {
  return {
    id: task.id,
    type: "task",
    content: task.title || "",
    timestamp: task.created_at,
    status: task.completed ? "completed" : "open",
    metadata: {
      dueDate: task.due_date,
      completedAt: task.completed_at,
      status: task.completed ? "completed" : task.cancelled ? "cancelled" : "open",
      priority: task.priority
    }
  };
};

// Map messages to timeline items
export const mapMessageToTimelineItem = (message: any): TimelineItem => {
  return {
    id: message.id,
    type: "message",
    content: message.content || "",
    timestamp: message.created_at || message.sent_at,
    platform: message.platform,
    metadata: {
      sender: message.sender || "user",
      receiver: message.receiver || "lead",
    }
  };
};

// Map files to timeline items
export const mapFileToTimelineItem = (file: any): TimelineItem => {
  return {
    id: file.id,
    type: "file_upload",
    content: file.file_name || "",
    timestamp: file.created_at,
    metadata: {
      fileName: file.file_name,
      fileType: file.file_type,
      fileSize: file.file_size,
      filePath: file.file_path
    }
  };
};

// Create a contact creation item
export const createContactCreationItem = (name: string, created_at: string): TimelineItem => {
  return {
    id: `contact-created-${Date.now()}`,
    type: "contact_created",
    content: `Kontakt ${name} wurde erstellt`,
    timestamp: created_at,
    metadata: {
      contactName: name
    }
  };
};

// Create a status change item
export const createStatusChangeItem = (status: string, timestamp: string, leadName: string): TimelineItem | null => {
  if (!status || status === 'lead') return null;
  
  const getStatusText = (status: string): string => {
    switch (status) {
      case 'partner':
        return 'Partner';
      case 'customer':
        return 'Kunde';
      case 'not_for_now':
        return 'Aktuell nicht interessiert';
      case 'no_interest':
        return 'Kein Interesse';
      default:
        return status;
    }
  };
  
  return {
    id: `status-${Date.now()}`,
    type: "status_change",
    content: `Status wurde auf "${getStatusText(status)}" gesetzt`,
    timestamp: timestamp,
    metadata: {
      newStatus: status,
      timestamp: timestamp,
      contactName: leadName
    }
  };
};

// Sort timeline items by timestamp (newest first)
export const sortTimelineItems = (items: TimelineItem[]): TimelineItem[] => {
  return [...items].sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
};

// Combine all timeline items from different sources
export const combineTimelineItems = (
  tasks: any[] = [],
  notes: any[] = [],
  activities: any[] = [],
  socialMediaPosts: SocialMediaPost[] = []
): TimelineItem[] => {
  const timelineItems = [
    ...mapTasksToTimelineItems(tasks),
    ...mapNotesToTimelineItems(notes),
    ...activities.map(activity => ({
      id: activity.id,
      type: activity.type as TimelineItemType,
      content: activity.content || "",
      timestamp: activity.created_at,
      metadata: activity.metadata
    })),
    ...mapSocialMediaPostsToTimelineItems(socialMediaPosts)
  ];
  
  return sortTimelineItems(timelineItems);
};
