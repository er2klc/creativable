import { Tables } from "@/integrations/supabase/types";
import { useSettings } from "@/hooks/use-settings";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare, Calendar, CheckSquare, StickyNote, History } from "lucide-react";
import { Platform } from "@/config/platforms";

interface TimelineEvent {
  id: string;
  type: 'message' | 'task' | 'note';
  content: string;
  timestamp: string;
  status?: string;
}

interface LeadTimelineProps {
  lead: Tables<"leads"> & {
    platform: Platform;
    messages: Tables<"messages">[];
    tasks: Tables<"tasks">[];
    notes: Tables<"notes">[];
  };
}

export function LeadTimeline({ lead }: LeadTimelineProps) {
  const { settings } = useSettings();

  // Combine all events into one timeline
  const timelineEvents: TimelineEvent[] = [
    ...lead.messages.map(message => ({
      id: message.id,
      type: 'message' as const,
      content: message.content,
      timestamp: message.sent_at || message.created_at || '',
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

  const getEventIcon = (type: string, status?: string) => {
    switch (type) {
      case 'message':
        return <MessageSquare className="h-4 w-4" />;
      case 'task':
        return <CheckSquare className="h-4 w-4" />;
      case 'note':
        return <StickyNote className="h-4 w-4" />;
      default:
        return <History className="h-4 w-4" />;
    }
  };

  const getEventColor = (type: string, status?: string) => {
    switch (type) {
      case 'message':
        return status === 'received' ? 'text-blue-500' : 'text-green-500';
      case 'task':
        return status === 'completed' ? 'text-green-500' : 'text-yellow-500';
      case 'note':
        return 'text-purple-500';
      default:
        return 'text-gray-500';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="h-5 w-5" />
          {settings?.language === "en" ? "Timeline" : "Zeitverlauf"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {timelineEvents.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            {settings?.language === "en" 
              ? "No activities yet" 
              : "Noch keine Aktivitäten"}
          </div>
        ) : (
          <div className="space-y-4">
            {timelineEvents.map((event) => (
              <div
                key={event.id}
                className="flex items-start gap-4 p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
              >
                <div className={`mt-1 ${getEventColor(event.type, event.status)}`}>
                  {getEventIcon(event.type, event.status)}
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">
                      {event.type === 'message' && (
                        <span>
                          {event.status === 'received' 
                            ? (settings?.language === "en" ? "Received Message" : "Erhaltene Nachricht")
                            : (settings?.language === "en" ? "Sent Message" : "Gesendete Nachricht")}
                        </span>
                      )}
                      {event.type === 'task' && (
                        <span>
                          {event.status === 'completed'
                            ? (settings?.language === "en" ? "Completed Task" : "Erledigte Aufgabe")
                            : (settings?.language === "en" ? "Task Created" : "Aufgabe erstellt")}
                        </span>
                      )}
                      {event.type === 'note' && (
                        <span>
                          {settings?.language === "en" ? "Note Added" : "Notiz hinzugefügt"}
                        </span>
                      )}
                    </p>
                    <time className="text-sm text-muted-foreground">
                      {new Date(event.timestamp).toLocaleString(
                        settings?.language === "en" ? "en-US" : "de-DE",
                        {
                          dateStyle: "medium",
                          timeStyle: "short",
                        }
                      )}
                    </time>
                  </div>
                  <p className="text-sm text-muted-foreground">{event.content}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}