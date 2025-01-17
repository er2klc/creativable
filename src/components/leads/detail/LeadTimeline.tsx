import { Tables } from "@/integrations/supabase/types";
import { format } from "date-fns";
import { MessageSquare, CheckSquare, StickyNote } from "lucide-react";

type TimelineItem = {
  id: string;
  type: 'message' | 'task' | 'note';
  content: string;
  timestamp: string;
  status?: string;
};

interface LeadTimelineProps {
  lead: {
    messages: Tables<"messages">[];
    tasks: Tables<"tasks">[];
    notes: Tables<"notes">[];
  };
}

export const LeadTimeline = ({ lead }: LeadTimelineProps) => {
  const timelineItems: TimelineItem[] = [
    ...lead.messages.map(message => ({
      id: message.id,
      type: 'message' as const,
      content: message.content,
      timestamp: message.sent_at || '',
      status: message.platform
    })),
    ...lead.tasks.map(task => ({
      id: task.id,
      type: 'task' as const,
      content: task.title,
      timestamp: task.created_at || '',
      status: task.completed ? 'completed' : 'pending'
    })),
    ...lead.notes.map(note => ({
      id: note.id,
      type: 'note' as const,
      content: note.content,
      timestamp: note.created_at || '',
    }))
  ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const getIcon = (type: TimelineItem['type']) => {
    switch (type) {
      case 'message':
        return <MessageSquare className="h-4 w-4" />;
      case 'task':
        return <CheckSquare className="h-4 w-4" />;
      case 'note':
        return <StickyNote className="h-4 w-4" />;
    }
  };

  const getItemColor = (type: TimelineItem['type']) => {
    switch (type) {
      case 'message':
        return 'text-blue-500';
      case 'task':
        return 'text-green-500';
      case 'note':
        return 'text-yellow-500';
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Aktivitäten</h3>
      <div className="space-y-4">
        {timelineItems.map((item) => (
          <div key={item.id} className="flex gap-4 items-start">
            <div className={`mt-1 ${getItemColor(item.type)}`}>
              {getIcon(item.type)}
            </div>
            <div className="flex-1">
              <div className="text-sm text-gray-500">
                {format(new Date(item.timestamp), 'dd.MM.yyyy HH:mm')}
              </div>
              <div className="text-sm">{item.content}</div>
              {item.status && (
                <div className="text-xs text-gray-500 mt-1">
                  Status: {item.status}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};