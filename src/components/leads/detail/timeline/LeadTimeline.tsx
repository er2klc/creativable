
import { useState } from "react";
import { useSettings } from "@/hooks/use-settings";
import { LeadWithRelations } from "@/integrations/supabase/types/leads";
import { ActivityTimeline } from "./components/ActivityTimeline";
import { SocialTimeline } from "./components/SocialTimeline";
import { TimelineHeader } from "./timeline/TimelineHeader";
import { 
  mapNoteToTimelineItem, 
  mapTaskToTimelineItem, 
  mapMessageToTimelineItem, 
  mapFileToTimelineItem,
  createContactCreationItem,
  createStatusChangeItem 
} from "./timeline/utils/timelineMappers";

interface LeadTimelineProps {
  lead: LeadWithRelations;
  onDeletePhaseChange?: (noteId: string) => void;
  onUpdateLead: (lead: LeadWithRelations) => void;
}

export const LeadTimeline = ({ lead, onDeletePhaseChange, onUpdateLead }: LeadTimelineProps) => {
  const { settings } = useSettings();
  const [activeTimeline, setActiveTimeline] = useState<'activities' | 'social'>('activities');
  
  const hasLinkedInPosts = Array.isArray(lead.linkedin_posts) && lead.linkedin_posts.length > 0;
  const hasSocialPosts = Array.isArray(lead.social_media_posts) && lead.social_media_posts.length > 0;
  const hasInstagramData = lead.platform === 'instagram' && lead.social_media_posts && lead.social_media_posts.length > 0;
  const showSocialTimeline = hasLinkedInPosts || hasSocialPosts || hasInstagramData;

  const statusChangeItem = createStatusChangeItem(
    lead.status || 'lead',
    lead.updated_at || lead.created_at || new Date().toISOString(),
    lead.name
  );

  const allActivities = [
    ...(statusChangeItem ? [statusChangeItem] : []),
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
          socialMediaPosts={lead.social_media_posts || []}
          leadId={lead.id}
        />
      )}
    </div>
  );
};
