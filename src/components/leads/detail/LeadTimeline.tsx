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
  
  const showSocialTimeline = (Array.isArray(lead.social_media_posts) && lead.social_media_posts.length > 0) ||
                            (Array.isArray(lead.linkedin_posts) && lead.linkedin_posts.length > 0);

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
      dueDate: task.due_date,
      status: task.completed ? 'completed' : task.cancelled ? 'cancelled' : undefined,
      completedAt: task.completed ? task.updated_at : undefined,
      color: task.color,
      meetingType: task.meeting_type
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

  const mapLinkedInPostToTimelineItem = (post: any): TimelineItemType => ({
    id: post.id,
    type: 'linkedin_post',
    content: post.content || '',
    created_at: post.posted_at || post.created_at,
    timestamp: post.posted_at || post.created_at,
    platform: 'linkedin',
    metadata: {
      likes_count: post.likes_count,
      comments_count: post.comments_count,
      shares_count: post.shares_count,
      media_urls: post.media_urls,
      reactions: post.reactions,
      company: post.company,
      position: post.position,
      start_date: post.start_date,
      end_date: post.end_date,
      school: post.school,
      degree: post.degree
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
    ...(lead.linkedin_posts || []).map(mapLinkedInPostToTimelineItem),
    contactCreationItem
  ];

  // Sort all activities by timestamp in reverse chronological order
  const timelineItems = allActivities.sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  // Transform social media posts to include required fields
  const transformedPosts: SocialMediaPostRaw[] = [
    ...(Array.isArray(lead.social_media_posts) ? lead.social_media_posts.map(post => ({
      ...post,
      platform: post.platform || 'instagram',
      type: post.post_type || 'post',
      caption: post.content || '',
      likesCount: post.likes_count || 0,
      commentsCount: post.comments_count || 0,
      timestamp: post.posted_at || post.created_at,
      engagement_count: (post.likes_count || 0) + (post.comments_count || 0),
      media_type: post.media_type || 'post',
      media_urls: post.media_urls || [],
      content: post.content || '',
      url: post.url || null
    })) : []),
    ...(Array.isArray(lead.linkedin_posts) ? lead.linkedin_posts.map(post => ({
      id: post.id,
      platform: 'linkedin',
      type: post.post_type || 'post',
      caption: post.content || '',
      likesCount: post.likes_count || 0,
      commentsCount: post.comments_count || 0,
      timestamp: post.posted_at || post.created_at,
      engagement_count: (post.likes_count || 0) + (post.comments_count || 0) + (post.shares_count || 0),
      media_type: post.media_type || 'post',
      media_urls: post.media_urls || [],
      content: post.content || '',
      url: post.url || null,
      metadata: {
        ...post.metadata,
        reactions: post.reactions || {}
      },
      company: post.company,
      position: post.position,
      start_date: post.start_date,
      end_date: post.end_date,
      school: post.school,
      degree: post.degree,
      school_linkedin_url: post.school_linkedin_url
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