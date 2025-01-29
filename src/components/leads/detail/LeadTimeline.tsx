import { useState } from "react";
import { TimelineHeader } from "./timeline/TimelineHeader";
import { TimelineItem } from "./timeline/TimelineItem";
import { SocialMediaTimeline } from "./timeline/SocialMediaTimeline";
import { useSettings } from "@/hooks/use-settings";
import { LeadWithRelations } from "./types/lead";
import { TimelineItem as TimelineItemType, SocialMediaPostRaw } from "./timeline/TimelineUtils";

interface LeadTimelineProps {
  lead: LeadWithRelations;
  onDeletePhaseChange?: (noteId: string) => void;
}

export const LeadTimeline = ({ lead, onDeletePhaseChange }: LeadTimelineProps) => {
  const { settings } = useSettings();
  const [activeTimeline, setActiveTimeline] = useState<'activities' | 'social'>('activities');
  
  const showSocialTimeline = Array.isArray(lead.social_media_posts) && lead.social_media_posts.length > 0;

  const mapNoteToTimelineItem = (note: any): TimelineItemType => ({
    id: note.id,
    type: note.metadata?.type === 'phase_change' ? 'phase_change' : 'note',
    content: note.content,
    created_at: note.created_at,
    timestamp: note.created_at,
    metadata: note.metadata,
    status: note.status
  });

  const mapTaskToTimelineItem = (task: any): TimelineItemType => ({
    id: task.id,
    type: 'task',
    content: task.title,
    created_at: task.created_at,
    timestamp: task.created_at,
    metadata: {
      completedAt: task.completed ? task.updated_at : undefined,
      dueDate: task.due_date,
      status: task.completed ? 'completed' : task.cancelled ? 'cancelled' : 'outdated'
    }
  });

  const mapMessageToTimelineItem = (message: any): TimelineItemType => ({
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

  const mapFileToTimelineItem = (file: any): TimelineItemType => ({
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

  // Create contact creation timeline item
  const contactCreationItem: TimelineItemType = {
    id: 'contact-creation',
    type: 'contact_created',
    content: `Kontakt ${lead.name} wurde erstellt`,
    created_at: lead.created_at,
    timestamp: lead.created_at,
    metadata: {
      type: 'contact_created'
    }
  };

  // Combine all activities
  const allActivities = [
    ...(lead.notes || []).map(mapNoteToTimelineItem),
    ...(lead.tasks || []).map(mapTaskToTimelineItem),
    ...(lead.messages || []).map(mapMessageToTimelineItem),
    ...(lead.lead_files || []).map(mapFileToTimelineItem),
    contactCreationItem
  ];

  // Sort all activities by timestamp in reverse chronological order
  const timelineItems = allActivities.sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  // Transform social media posts
  const transformedPosts: SocialMediaPostRaw[] = [
    ...(Array.isArray(lead.social_media_posts) ? lead.social_media_posts.map(post => ({
      id: typeof post === 'string' ? post : post.id || '',
      platform: typeof post === 'string' ? '' : post.platform || 'instagram',
      type: typeof post === 'string' ? '' : post.post_type || 'post',
      post_type: typeof post === 'string' ? 'post' : post.post_type || 'post',
      caption: typeof post === 'string' ? '' : post.content || '',
      likesCount: typeof post === 'string' ? 0 : post.likes_count || 0,
      commentsCount: typeof post === 'string' ? 0 : post.comments_count || 0,
      posted_at: typeof post === 'string' ? null : post.posted_at || post.created_at || null,
      timestamp: typeof post === 'string' ? '' : post.posted_at || post.created_at || '',
      engagement_count: typeof post === 'string' ? 0 : (post.likes_count || 0) + (post.comments_count || 0),
      media_type: typeof post === 'string' ? '' : post.media_type || 'post',
      media_urls: typeof post === 'string' ? [] : post.media_urls || [],
      content: typeof post === 'string' ? '' : post.content || '',
      url: typeof post === 'string' ? null : post.url || null,
      location: null,
      mentioned_profiles: null,
      tagged_profiles: null,
      local_video_path: null,
      local_media_paths: null,
      video_url: null,
      metadata: {}
    })) : []),
    ...(Array.isArray(lead.linkedin_posts) ? lead.linkedin_posts.map(post => ({
      id: post.id,
      platform: 'linkedin',
      type: post.post_type || 'post',
      post_type: post.post_type || 'post',
      caption: post.content || '',
      likesCount: post.likes_count || 0,
      commentsCount: post.comments_count || 0,
      posted_at: post.posted_at || post.created_at || null,
      timestamp: post.posted_at || post.created_at || '',
      engagement_count: (post.likes_count || 0) + (post.comments_count || 0) + (post.shares_count || 0),
      media_type: post.media_type || 'post',
      media_urls: post.media_urls || [],
      content: post.content || '',
      url: post.url || null,
      location: null,
      mentioned_profiles: null,
      tagged_profiles: null,
      local_video_path: null,
      local_media_paths: null,
      video_url: null,
      metadata: post.metadata || {},
      company: post.company,
      position: post.position,
      start_date: post.start_date,
      end_date: post.end_date,
      school: post.school,
      degree: post.degree
    })) : [])
  ];

  return (
    <div className="space-y-4">
      <TimelineHeader 
        title={settings?.language === "en" ? "Activities" : "Aktivitäten"}
        showSocialTimeline={showSocialTimeline}
        activeTimeline={activeTimeline}
        onTimelineChange={setActiveTimeline}
      />

      {activeTimeline === 'activities' ? (
        <div className="relative space-y-6">
          <div className="absolute left-4 top-2 bottom-2 w-[2px] bg-gray-400" />
          {timelineItems.map((item) => (
            <TimelineItem 
              key={item.id} 
              item={item} 
              onDelete={onDeletePhaseChange && item.type !== 'contact_created' ? 
                () => onDeletePhaseChange(item.id) : 
                undefined
              } 
            />
          ))}
        </div>
      ) : (
        <SocialMediaTimeline posts={transformedPosts} />
      )}
    </div>
  );
};
