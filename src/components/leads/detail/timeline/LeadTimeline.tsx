import { useState } from "react";
import { TimelineHeader } from "./TimelineHeader";
import { TimelineItem } from "./TimelineItem";
import { SocialMediaTimeline } from "./social/SocialMediaTimeline";
import { LinkedInTimeline } from "./social/LinkedInTimeline";
import { useSettings } from "@/hooks/use-settings";
import { LeadWithRelations } from "../types/lead";
import { TimelineItem as TimelineItemType } from "./TimelineUtils";
import { useSocialMediaPosts } from "../hooks/useSocialMediaPosts";

interface LeadTimelineProps {
  lead: LeadWithRelations;
  onDeletePhaseChange?: (noteId: string) => void;
}

export const LeadTimeline = ({ lead, onDeletePhaseChange }: LeadTimelineProps) => {
  const { settings } = useSettings();
  const [activeTimeline, setActiveTimeline] = useState<'activities' | 'social'>('activities');
  const { data: socialMediaPosts } = useSocialMediaPosts(lead.id);
  
  // Überprüfe, ob LinkedIn Posts vorhanden sind
  const hasLinkedInPosts = Array.isArray(lead.linkedin_posts) && lead.linkedin_posts.length > 0;
  console.log("LinkedIn Posts vorhanden:", hasLinkedInPosts, lead.linkedin_posts);
  
  // Überprüfe, ob Social Media Posts vorhanden sind
  const hasSocialPosts = Array.isArray(lead.social_media_posts) && lead.social_media_posts.length > 0;
  console.log("Social Media Posts vorhanden:", hasSocialPosts, lead.social_media_posts);
  
  // Zeige die Social Timeline an, wenn entweder LinkedIn oder andere Social Media Posts vorhanden sind
  const showSocialTimeline = hasLinkedInPosts || hasSocialPosts;

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

  const allActivities = [
    ...(lead.notes || []).map(mapNoteToTimelineItem),
    ...(lead.tasks || []).map(mapTaskToTimelineItem),
    ...(lead.messages || []).map(mapMessageToTimelineItem),
    ...(lead.lead_files || []).map(mapFileToTimelineItem),
    contactCreationItem
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
        lead.platform === 'LinkedIn' && hasLinkedInPosts ? (
          <LinkedInTimeline posts={lead.linkedin_posts || []} />
        ) : (
          <SocialMediaTimeline 
            posts={socialMediaPosts || []}
            linkedInPosts={lead.linkedin_posts || []}
            platform={lead.platform}
            kontaktIdFallback={lead.id}
          />
        )
      )}
    </div>
  );
};