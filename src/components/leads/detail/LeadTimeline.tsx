import { useState } from "react";
import { TimelineHeader } from "./timeline/TimelineHeader";
import { TimelineItem } from "./timeline/TimelineItem";
import { SocialMediaTimeline } from "./timeline/SocialMediaTimeline";
import { useSettings } from "@/hooks/use-settings";
import { LeadWithRelations } from "./types/lead";
import { TimelineItem as TimelineItemType } from "./TimelineUtils";
import { SocialMediaPost } from "./timeline/types/socialMedia";

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
  const transformedPosts: SocialMediaPost[] = Array.isArray(lead.social_media_posts) 
    ? (lead.social_media_posts as any[]).map(post => ({
        ...post,
        likes_count: post.likes_count || 0,
        comments_count: post.comments_count || 0,
        content: post.content || '',
        caption: post.caption || '',
        url: post.url || null,
        location: post.location || null,
        posted_at: post.posted_at || post.created_at || new Date().toISOString(),
        local_media_paths: post.local_media_paths || [],
        video_url: post.video_url || null,
        hashtags: post.hashtags || []
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