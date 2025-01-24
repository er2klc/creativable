import { useState } from "react";
import { TimelineHeader } from "./timeline/TimelineHeader";
import { TimelineItem } from "./timeline/TimelineItem";
import { SocialMediaTimeline } from "./timeline/SocialMediaTimeline";
import { useSettings } from "@/hooks/use-settings";
import { LeadWithRelations } from "./types/lead";
import { TimelineItem as TimelineItemType } from "./timeline/TimelineUtils";

interface LeadTimelineProps {
  lead: LeadWithRelations;
  onDeletePhaseChange?: (noteId: string) => void;
}

interface SocialMediaPostRaw {
  id: string;
  platform: string;
  post_type: string;
  content: string | null;
  likes_count: number | null;
  comments_count: number | null;
  url: string | null;
  location: string | null;
  mentioned_profiles: string[] | null;
  tagged_profiles: string[] | null;
  posted_at: string | null;
  metadata: any;
  media_urls: string[] | null;
  media_type: string | null;
  local_video_path: string | null;
  local_media_paths: string[] | null;
  engagement_count: number | null;
  first_comment: string | null;
  lead_id?: string | null;
  tagged_users?: any[] | null;
  video_url: string | null;
}

export const LeadTimeline = ({ lead, onDeletePhaseChange }: LeadTimelineProps) => {
  const { settings } = useSettings();
  const [activeTimeline, setActiveTimeline] = useState<'activities' | 'social'>('activities');
  
  // Check if lead was created via Apify (has social media data)
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

  // Sort notes in reverse chronological order (newest first)
  const sortedNotes = (lead.notes || [])
    .map(mapNoteToTimelineItem)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  // Add contact creation item at the end (it will appear at the bottom)
  const timelineItems = [...sortedNotes, contactCreationItem];

  // Transform social media posts to include required fields
  const transformedPosts: SocialMediaPostRaw[] = Array.isArray(lead.social_media_posts) 
    ? (lead.social_media_posts as any[]).map(post => ({
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
        metadata: post.metadata || {},
        posted_at: post.posted_at || post.created_at || new Date().toISOString(),
        local_video_path: post.local_video_path || null,
        local_media_paths: post.local_media_paths || null,
        video_url: post.video_url || null
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