import { useState } from "react";
import { TimelineHeader } from "./TimelineHeader";
import { useSettings } from "@/hooks/use-settings";
import { LeadWithRelations } from "@/types/leads";
import { useSocialMediaPosts } from "./hooks/useSocialMediaPosts";
import { ActivityTimeline } from "./timeline/components/ActivityTimeline";
import { SocialTimeline } from "./timeline/components/SocialTimeline";
import { 
  mapNoteToTimelineItem,
  mapTaskToTimelineItem,
  mapMessageToTimelineItem,
  mapFileToTimelineItem,
  createContactCreationItem
} from "./timeline/utils/timelineMappers";

interface LeadTimelineProps {
  lead: LeadWithRelations;
  onDeletePhaseChange?: (noteId: string) => void;
}

export const LeadTimeline = ({ lead, onDeletePhaseChange }: LeadTimelineProps) => {
  const { settings } = useSettings();
  const [activeTimeline, setActiveTimeline] = useState<'activities' | 'social'>('activities');
  const { data: socialMediaPosts } = useSocialMediaPosts(lead.id);

  const hasLinkedInPosts = Array.isArray(lead.linkedin_posts) && lead.linkedin_posts.length > 0;
  const hasSocialPosts = Array.isArray(socialMediaPosts) && socialMediaPosts.length > 0;
  const hasInstagramData = lead.apify_instagram_data && 
    (typeof lead.apify_instagram_data === 'object' || 
     Array.isArray(JSON.parse(typeof lead.apify_instagram_data === 'string' ? lead.apify_instagram_data : '[]')));
  const showSocialTimeline = hasLinkedInPosts || hasSocialPosts || hasInstagramData;

  const statusChangeItem = {
    id: `status-${lead.id}`,
    type: "status_change" as const,
    content: `Status geändert zu ${lead.status}`,
    timestamp: lead.updated_at || lead.created_at || new Date().toISOString(),
    metadata: {
      newStatus: lead.status
    }
  };

  const allActivities = [
    statusChangeItem,
    ...(lead.notes || []).map(mapNoteToTimelineItem),
    ...(lead.tasks || []).map(mapTaskToTimelineItem),
    ...(lead.messages || []).map(mapMessageToTimelineItem),
    ...(lead.lead_files || []).map(mapFileToTimelineItem),
    createContactCreationItem(lead.name, lead.created_at)
  ];

  const timelineItems = allActivities.sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  return (
    <div className="space-y-4">
      <TimelineHeader 
        title={activeTimeline === 'activities' ? 
          (settings?.language === "en" ? "Activities" : "Aktivitäten") :
          (settings?.language === "en" ? "Social Media Activities" : "Social Media Aktivitäten")
        }
        showSocialTimeline={showSocialTimeline}
        activeTimeline={activeTimeline}
        onTimelineChange={setActiveTimeline}
        platform={lead.platform}
        hasLinkedInPosts={hasLinkedInPosts}
      />

      {activeTimeline === 'activities' ? (
        <ActivityTimeline 
          items={timelineItems}
          onDeletePhaseChange={onDeletePhaseChange}
        />
      ) : (
        <SocialTimeline 
          platform={lead.platform}
          hasLinkedInPosts={hasLinkedInPosts}
          linkedInPosts={lead.linkedin_posts || []}
          socialMediaPosts={socialMediaPosts || []}
          leadId={lead.id}
        />
      )}
    </div>
  );
};