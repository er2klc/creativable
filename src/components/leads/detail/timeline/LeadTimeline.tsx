import { useState } from "react";
import { TimelineHeader } from "./TimelineHeader";
import { TimelineItem } from "./TimelineItem";
import { SocialMediaTimeline } from "./SocialMediaTimeline";
import { useSettings } from "@/hooks/use-settings";
import { LeadWithRelations } from "../types/lead";
import { TimelineItem as TimelineItemType } from "./TimelineUtils";

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
      completed: task.completed,
      due_date: task.due_date,
      color: task.color
    }
  });

  const mapMessageToTimelineItem = (message: any): TimelineItemType => ({
    id: message.id,
    type: 'message',
    content: message.content,
    created_at: message.created_at,
    timestamp: message.sent_at || message.created_at,
    metadata: {
      platform: message.platform
    }
  });

  const mapFileToTimelineItem = (file: any): TimelineItemType => ({
    id: file.id,
    type: 'file',
    content: file.file_name,
    created_at: file.created_at,
    timestamp: file.created_at,
    metadata: {
      file_path: file.file_path,
      file_type: file.file_type,
      file_size: file.file_size
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
  const transformedPosts = Array.isArray(lead.social_media_posts) 
    ? lead.social_media_posts.map(post => ({
        ...post,
        engagement_count: post.engagement_count || 0,
        first_comment: post.first_comment || '',
        media_type: post.media_type || 'post',
        media_urls: post.media_urls || [],
        tagged_users: post.tagged_users || [],
        comments_count: post.comments_count || 0,
        content: post.content || '',
        created_at: post.created_at || post.posted_at || new Date().toISOString(),
        likes_count: post.likes_count || 0,
        location: post.location || '',
        mentioned_profiles: post.mentioned_profiles || [],
        tagged_profiles: post.tagged_profiles || [],
        platform: post.platform || 'unknown',
        post_type: post.post_type || 'post',
        url: post.url || null,
        lead_id: post.lead_id || lead.id,
        metadata: post.metadata || {}
      }))
    : [];

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