import { useState } from "react";
import { TimelineHeader } from "./TimelineHeader";
import { TimelineItem } from "./TimelineItem";
import { SocialMediaTimeline } from "./SocialMediaTimeline";
import { useSettings } from "@/hooks/use-settings";
import { LeadWithRelations } from "./types/lead";
import { TimelineItem as TimelineItemType } from "./TimelineUtils";

interface LeadTimelineProps {
  lead: LeadWithRelations;
  onDeletePhaseChange?: (noteId: string) => void;
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

  // Sort notes in ascending chronological order (oldest first)
  const sortedNotes = [...(lead.notes || [])].sort((a, b) => {
    return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
  });

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
          {sortedNotes.map((note) => (
            <TimelineItem 
              key={note.id} 
              item={mapNoteToTimelineItem(note)} 
              onDelete={onDeletePhaseChange ? () => onDeletePhaseChange(note.id) : undefined} 
            />
          ))}
        </div>
      ) : (
        <SocialMediaTimeline 
          posts={lead.social_media_posts as Array<{
            comments_count: number;
            content: string;
            created_at: string;
            id: string;
            lead_id: string;
            likes_count: number;
            location: string;
            mentioned_profiles: string[];
            metadata: any;
            platform: string;
            post_type: string;
            posted_at: string;
            tagged_profiles: string[];
            url: string;
          }>} 
        />
      )}
    </div>
  );
};