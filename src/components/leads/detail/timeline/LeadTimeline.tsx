import { useSettings } from "@/hooks/use-settings";
import TimelineHeader from "./timeline/TimelineHeader";
import TimelineItem from "./timeline/TimelineItem";
import SocialMediaTimeline from "./timeline/social/SocialMediaTimeline";
import LinkedInTimeline from "./timeline/social/LinkedInTimeline";
import { LeadWithRelations } from "../types/lead";
import { Note } from "../types/lead";
import { Task } from "../types/lead";
import { useSocialMediaPosts } from "./hooks/useSocialMediaPosts";

interface LeadTimelineProps {
  lead: LeadWithRelations;
}

export const LeadTimeline = ({ lead }: LeadTimelineProps) => {
  const { settings } = useSettings();
  const { data: socialMediaPosts } = useSocialMediaPosts(lead.id);

  // Debug output
  console.log("Timeline Data:", {
    hasLinkedInPosts: lead.linkedin_posts?.length > 0,
    linkedInPostsCount: lead.linkedin_posts?.length,
    hasSocialMediaPosts: socialMediaPosts?.length > 0,
    socialMediaPostsCount: socialMediaPosts?.length,
    timestamp: new Date().toISOString()
  });

  // Combine notes and tasks
  const timelineItems = [
    ...(lead.notes || []).map((note: Note) => ({
      type: "note" as const,
      data: note,
      timestamp: note.created_at,
    })),
    ...(lead.tasks || []).map((task: Task) => ({
      type: "task" as const,
      data: task,
      timestamp: task.created_at,
    })),
  ].sort((a, b) => {
    const dateA = new Date(a.timestamp || 0);
    const dateB = new Date(b.timestamp || 0);
    return dateB.getTime() - dateA.getTime();
  });

  return (
    <div className="space-y-4">
      {/* Debug message */}
      {process.env.NODE_ENV === "development" && (
        <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
          Debug: Timeline items count: {timelineItems.length}, 
          Social media posts: {socialMediaPosts?.length || 0}, 
          LinkedIn posts: {lead.linkedin_posts?.length || 0}
        </div>
      )}

      {/* Timeline content */}
      <div className="space-y-6">
        <TimelineHeader />

        {/* Social Media Timeline */}
        {socialMediaPosts && socialMediaPosts.length > 0 && (
          <SocialMediaTimeline posts={socialMediaPosts} />
        )}

        {/* LinkedIn Timeline */}
        {lead.linkedin_posts && lead.linkedin_posts.length > 0 && (
          <LinkedInTimeline posts={lead.linkedin_posts} />
        )}

        {/* Regular Timeline Items */}
        {timelineItems.map((item, index) => (
          <TimelineItem
            key={`${item.type}-${index}`}
            type={item.type}
            data={item.data}
          />
        ))}

        {/* Empty State */}
        {timelineItems.length === 0 && !socialMediaPosts?.length && !lead.linkedin_posts?.length && (
          <div className="text-center py-8 text-gray-500">
            {settings?.language === "en" 
              ? "No timeline items yet" 
              : "Noch keine Timeline-Einträge"}
          </div>
        )}
      </div>
    </div>
  );
};