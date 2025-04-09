import { useState } from "react";
import { useSettings } from "@/hooks/use-settings";
import { LeadWithRelations } from "@/types/leads";
import { useSocialMediaPosts } from "./hooks/useSocialMediaPosts";
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
}

export const LeadTimeline = ({ lead, onDeletePhaseChange }: LeadTimelineProps) => {
  const { settings } = useSettings();
  const [activeTimeline, setActiveTimeline] = useState<'activities' | 'social'>('activities');
  const { data: socialMediaPosts } = useSocialMediaPosts(lead.id);
  
  console.log("DEBUG - LeadTimeline render:", {
    leadId: lead.id,
    hasLinkedInPosts: Array.isArray(lead.linkedin_posts) && lead.linkedin_posts.length > 0,
    linkedInPostsData: lead.linkedin_posts,
    socialMediaPosts: socialMediaPosts?.length || 0,
    activeTimeline,
    timestamp: new Date().toISOString()
  });

  const hasLinkedInPosts = Array.isArray(lead.linkedin_posts) && lead.linkedin_posts.length > 0;
  const hasSocialPosts = Array.isArray(socialMediaPosts) && socialMediaPosts.length > 0;
  const hasInstagramData = lead.apify_instagram_data && 
    (typeof lead.apify_instagram_data === 'object' || 
     Array.isArray(JSON.parse(typeof lead.apify_instagram_data === 'string' ? lead.apify_instagram_data : '[]')));
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
          socialMediaPosts={socialMediaPosts || []}
          leadId={lead.id}
        />
      )}
    </div>
  );
};