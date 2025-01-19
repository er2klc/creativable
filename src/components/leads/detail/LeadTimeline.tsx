import { Tables } from "@/integrations/supabase/types";
import { TimelineHeader } from "./timeline/TimelineHeader";
import { TimelineItem } from "./timeline/TimelineItem";
import { TimelineItem as TimelineItemType, TimelineItemType as ItemType } from "./timeline/TimelineUtils";
import { useEffect, useRef, useMemo } from "react";

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
  const messages = Array.isArray(lead.messages) ? lead.messages : [];
  const tasks = Array.isArray(lead.tasks) ? lead.tasks : [];
  const notes = Array.isArray(lead.notes) ? lead.notes : [];

  const timelineItems: TimelineItemType[] = useMemo(() => [
    {
      id: 'contact-created',
      type: 'contact_created' as const,
      content: `Kontakt ${lead.name} wurde erstellt`,
      timestamp: lead.created_at || new Date().toISOString(),
    },
    ...messages.map(message => ({
      id: message.id,
      type: 'message' as const,
      content: message.content,
      timestamp: message.sent_at || new Date().toISOString(),
      status: message.platform,
      platform: message.platform
    })),
    ...tasks.map(task => ({
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
    })),
    ...notes.map(note => {
      const metadata = note.metadata as { type?: string; oldPhase?: string; newPhase?: string; color?: string };
      
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
      return {
        id: note.id,
        type: 'note' as const,
        content: note.content,
        timestamp: note.created_at || new Date().toISOString(),
        metadata: {
          color: note.color
        }
      };
    })
  ].sort((a, b) => {
    const dateA = new Date(a.timestamp || new Date());
    const dateB = new Date(b.timestamp || new Date());
    return dateB.getTime() - dateA.getTime();
  }), [messages, tasks, notes, lead.created_at, lead.name]);

  return (
    <div className="p-4">
      <TimelineHeader title="Aktivitäten" />
      <div className="relative space-y-6">
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