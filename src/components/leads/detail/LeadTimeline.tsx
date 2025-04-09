import React from "react";
import { useSettings } from "@/hooks/use-settings";
import {
  Timeline,
  TimelineContent,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineIcon,
} from "@/components/ui/timeline";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CalendarDays, MessageSquare, User } from "lucide-react";
import { format } from "date-fns";
import { de, enUS } from "date-fns/locale";
import { LeadWithRelations } from "@/integrations/supabase/types/leads";
import { Note } from "@/integrations/supabase/types/notes";
import { StatusBadge } from "@/components/changelog/StatusBadge";
import { TimelineHeader } from "./timeline/TimelineHeader";
import { LeadPhase } from "@/integrations/supabase/types/lead-phases";
import { LeadDetailNote } from "./timeline/LeadDetailNote";
import { LeadDetailStatusChange } from "./timeline/LeadDetailStatusChange";
import { LeadDetailAppointment } from "./timeline/LeadDetailAppointment";
import { LeadDetailSocialPost } from "./timeline/LeadDetailSocialPost";

interface LeadTimelineProps {
  lead: LeadWithRelations;
  onUpdateLead: (values: Partial<LeadWithRelations>) => void;
  onDeletePhaseChange: (noteId: string) => void;
}

export const LeadTimeline = ({ 
  lead, 
  onUpdateLead,
  onDeletePhaseChange
}: LeadTimelineProps) => {
  const { settings } = useSettings();
  const [activeTimeline, setActiveTimeline] = React.useState<'activities' | 'social'>('activities');
  const hasLinkedInPosts = lead.linkedin_posts && lead.linkedin_posts.length > 0;
  const showSocialTimeline = !!lead.platform && (lead.platform === 'linkedin' || hasLinkedInPosts);

  const sortedNotes = React.useMemo(() => {
    const allNotes = [
      ...(lead.notes || []),
      ...(lead.appointments || []).map(appointment => ({
        ...appointment,
        type: 'appointment'
      }))
    ];

    return allNotes.sort((a: any, b: any) => {
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      return dateB - dateA;
    });
  }, [lead.notes, lead.appointments]);

  const locale = settings?.language === "de" ? de : enUS;

  const getInitials = (name: string) => {
    return name?.charAt(0).toUpperCase() || "U";
  };

  const renderTimelineItem = (note: Note | any) => {
    if (note.type === 'status_change') {
      return (
        <LeadDetailStatusChange 
          note={note} 
          lead={lead}
          onUpdateLead={onUpdateLead}
          onDeleteClick={onDeletePhaseChange}
        />
      );
    } else if (note.type === 'appointment') {
      return (
        <LeadDetailAppointment 
          appointment={note}
          locale={locale}
        />
      );
    } else {
      return (
        <LeadDetailNote 
          note={note} 
          locale={locale}
          onDeleteClick={onDeletePhaseChange}
        />
      );
    }
  };

  const renderSocialTimelineItem = (post: any) => {
    return (
      <LeadDetailSocialPost 
        post={post}
      />
    );
  };

  return (
    <div className="relative">
      <TimelineHeader
        title={
          settings?.language === "en" ? "Timeline" : "Zeitleiste"
        }
        showSocialTimeline={showSocialTimeline}
        activeTimeline={activeTimeline}
        onTimelineChange={setActiveTimeline}
        platform={lead.platform}
        hasLinkedInPosts={hasLinkedInPosts}
      />
      <Timeline>
        {activeTimeline === 'activities' && sortedNotes.map((note: Note | any) => (
          <TimelineItem key={note.id}>
            <TimelineSeparator>
              <TimelineIcon>
                <Avatar className="h-8 w-8">
                  <AvatarImage src={note.created_by_avatar} alt={note.created_by_name} />
                  <AvatarFallback>{getInitials(note.created_by_name)}</AvatarFallback>
                </Avatar>
              </TimelineIcon>
              <TimelineConnector />
            </TimelineSeparator>
            <TimelineContent className="pb-5">
              {renderTimelineItem(note)}
            </TimelineContent>
          </TimelineItem>
        ))}

        {activeTimeline === 'social' && lead.linkedin_posts && lead.linkedin_posts.map((post: any) => (
          <TimelineItem key={post.id}>
            <TimelineSeparator>
              <TimelineIcon>
                <Avatar className="h-8 w-8">
                  <AvatarImage src={lead.linkedin_profile_picture} alt={lead.linkedin_profile_name} />
                  <AvatarFallback>{getInitials(lead.linkedin_profile_name)}</AvatarFallback>
                </Avatar>
              </TimelineIcon>
              <TimelineConnector />
            </TimelineSeparator>
            <TimelineContent className="pb-5">
              {renderSocialTimelineItem(post)}
            </TimelineContent>
          </TimelineItem>
        ))}
      </Timeline>
    </div>
  );
};
