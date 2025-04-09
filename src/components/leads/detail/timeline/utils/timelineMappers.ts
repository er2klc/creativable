
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
export const mapNotesToTimelineItems = (notes: any[]): TimelineItem[] => {
  return notes.map(note => ({
    id: note.id,
    type: "note",
    content: note.content || "",
    timestamp: note.created_at,
    metadata: {
      updatedAt: note.updated_at,
      lastEditedAt: note.updated_at
    }
  }));
};

// Map activities to timeline items
export const mapActivitiesToTimelineItems = (activities: any[]): TimelineItem[] => {
  return activities.filter(activity => activity.type === "phase_change").map(activity => ({
    id: activity.id,
    type: "phase_change",
    content: activity.content || "",
    timestamp: activity.created_at,
    metadata: {
      type: activity.metadata?.type || "phase_change",
      oldPhase: activity.metadata?.old_phase,
      newPhase: activity.metadata?.new_phase,
      oldStatus: activity.metadata?.old_status,
      newStatus: activity.metadata?.new_status
    }
  }));
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
    ...mapActivitiesToTimelineItems(activities),
    ...mapSocialMediaPostsToTimelineItems(socialMediaPosts)
  ];
  
  return sortTimelineItems(timelineItems);
};
