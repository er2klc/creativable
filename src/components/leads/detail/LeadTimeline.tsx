import { Tables } from "@/integrations/supabase/types";
import { TimelineHeader } from "./timeline/TimelineHeader";
import { TimelineItem } from "./timeline/TimelineItem";
import { TimelineItem as TimelineItemType, TimelineItemType as ItemType } from "./timeline/TimelineUtils";

interface LeadTimelineProps {
  lead: {
    messages: Tables<"messages">[];
    tasks: Tables<"tasks">[];
    notes: Tables<"notes">[];
    created_at: string;
    name: string;
  };
}

export const LeadTimeline = ({ lead }: LeadTimelineProps) => {
  const timelineItems: TimelineItemType[] = [
    {
      id: 'contact-created',
      type: 'contact_created' as const,
      content: `Kontakt ${lead.name} wurde erstellt`,
      timestamp: lead.created_at,
    },
    ...(Array.isArray(lead.messages) ? lead.messages.map(message => ({
      id: message.id,
      type: 'message' as const,
      content: message.content,
      timestamp: message.sent_at || '',
      status: message.platform,
      platform: message.platform
    })) : []),
    ...(Array.isArray(lead.tasks) ? lead.tasks.map(task => ({
      id: task.id,
      type: task.meeting_type ? ('appointment' as const) : ('task' as const),
      content: task.title,
      timestamp: task.created_at || '',
      status: task.completed ? 'completed' : 'pending',
      metadata: {
        dueDate: task.due_date,
        meetingType: task.meeting_type,
        color: task.color
      }
    })) : []),
    ...(Array.isArray(lead.notes) ? lead.notes.map(note => {
      // Check if this is a phase change note
      if (note.metadata?.type === 'phase_change') {
        return {
          id: note.id,
          type: 'phase_change' as const,
          content: note.content,
          timestamp: note.created_at || '',
          metadata: {
            oldPhase: note.metadata.oldPhase,
            newPhase: note.metadata.newPhase,
            color: note.color
          }
        };
      }
      // Regular note
      return {
        id: note.id,
        type: 'note' as const,
        content: note.content,
        timestamp: note.created_at || '',
        metadata: {
          color: note.color
        }
      };
    }) : [])
  ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return (
    <div className="p-4">
      <TimelineHeader title="Aktivitäten" />
      <div className="relative space-y-6">
        {/* Vertical Timeline Line */}
        <div className="absolute left-4 top-2 bottom-2 w-[2px] bg-gray-200" />
        
        {timelineItems.map((item) => (
          <TimelineItem key={item.id} item={item} />
        ))}
        
        {timelineItems.length === 0 && (
          <div className="text-center text-muted-foreground py-4">
            Noch keine Aktivitäten vorhanden
          </div>
        )}
      </div>
    </div>
  );
};