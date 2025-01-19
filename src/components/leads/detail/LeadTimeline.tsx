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
  onDeletePhaseChange: (noteId: string) => void;
}

export const LeadTimeline = ({ lead, onDeletePhaseChange }: LeadTimelineProps) => {
  console.log('Timeline lead data:', {
    messages: lead.messages?.length || 0,
    tasks: lead.tasks?.length || 0,
    notes: lead.notes?.length || 0,
    created_at: lead.created_at
  });

  const timelineItems: TimelineItemType[] = [
    // Always include contact creation as first item
    {
      id: 'contact-created',
      type: 'contact_created' as const,
      content: `Kontakt ${lead.name} wurde erstellt`,
      timestamp: lead.created_at || new Date().toISOString(), // Fallback if created_at is null
    },
    // Map messages if they exist
    ...(Array.isArray(lead.messages) ? lead.messages.map(message => ({
      id: message.id,
      type: 'message' as const,
      content: message.content,
      timestamp: message.sent_at || new Date().toISOString(),
      status: message.platform,
      platform: message.platform
    })) : []),
    // Map tasks if they exist
    ...(Array.isArray(lead.tasks) ? lead.tasks.map(task => ({
      id: task.id,
      type: task.meeting_type ? ('appointment' as const) : ('task' as const),
      content: task.title,
      timestamp: task.created_at || new Date().toISOString(),
      status: task.completed ? 'completed' : 'pending',
      metadata: {
        dueDate: task.due_date,
        meetingType: task.meeting_type,
        color: task.color
      }
    })) : []),
    // Map notes if they exist
    ...(Array.isArray(lead.notes) ? lead.notes.map(note => {
      const metadata = note.metadata as { type?: string; oldPhase?: string; newPhase?: string; color?: string };
      
      // Check if this is a phase change note
      if (metadata?.type === 'phase_change') {
        return {
          id: note.id,
          type: 'phase_change' as const,
          content: note.content,
          timestamp: note.created_at || new Date().toISOString(),
          metadata: {
            oldPhase: metadata.oldPhase,
            newPhase: metadata.newPhase,
            color: note.color
          }
        };
      }
      // Regular note
      return {
        id: note.id,
        type: 'note' as const,
        content: note.content,
        timestamp: note.created_at || new Date().toISOString(),
        metadata: {
          color: note.color
        }
      };
    }) : [])
  ].sort((a, b) => {
    const dateA = new Date(a.timestamp || new Date());
    const dateB = new Date(b.timestamp || new Date());
    return dateB.getTime() - dateA.getTime();
  });

  console.log('Sorted timeline items:', timelineItems);

  return (
    <div className="p-4">
      <TimelineHeader title="Aktivitäten" />
      <div className="relative space-y-6">
        {/* Vertical Timeline Line */}
        <div className="absolute left-4 top-2 bottom-2 w-[2px] bg-gray-200" />
        
        {timelineItems.length > 0 ? (
          timelineItems.map((item) => (
            <TimelineItem 
              key={item.id} 
              item={item} 
              onDelete={item.type === 'phase_change' ? () => onDeletePhaseChange(item.id) : undefined}
            />
          ))
        ) : (
          <div className="text-center text-muted-foreground py-4">
            Noch keine Aktivitäten vorhanden
          </div>
        )}
      </div>
    </div>
  );
};