import { Tables } from "@/integrations/supabase/types";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { 
  MessageSquare, 
  CheckSquare, 
  StickyNote, 
  Phone, 
  Mail, 
  Calendar,
  ArrowRight,
  FileText,
  Bell,
  Instagram,
  Linkedin,
  MessageCircle,
  UserPlus
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

type TimelineItem = {
  id: string;
  type: "message" | "task" | "note" | "phase_change" | "reminder" | "upload" | "contact_created";
  content: string;
  timestamp: string;
  status?: string;
  platform?: string;
  metadata?: any;
};

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
  const timelineItems: TimelineItem[] = [
    // Add contact creation as first item
    {
      id: 'contact-created',
      type: 'contact_created',
      content: `Kontakt ${lead.name} wurde erstellt`,
      timestamp: lead.created_at,
    },
    ...lead.messages.map(message => ({
      id: message.id,
      type: 'message' as const,
      content: message.content,
      timestamp: message.sent_at || '',
      status: message.platform,
      platform: message.platform
    })),
    ...lead.tasks.map(task => ({
      id: task.id,
      type: 'task' as const,
      content: task.title,
      timestamp: task.created_at || '',
      status: task.completed ? 'completed' : 'pending',
      metadata: {
        dueDate: task.due_date,
        meetingType: task.meeting_type,
        color: task.color
      }
    })),
    ...lead.notes.map(note => ({
      id: note.id,
      type: 'note' as const,
      content: note.content,
      timestamp: note.created_at || '',
      metadata: {
        color: note.color
      }
    }))
  ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const getIcon = (type: TimelineItem['type'], platform?: string) => {
    switch (type) {
      case 'contact_created':
        return <UserPlus className="h-4 w-4" />;
      case 'message':
        if (platform === 'instagram') return <Instagram className="h-4 w-4" />;
        if (platform === 'linkedin') return <Linkedin className="h-4 w-4" />;
        if (platform === 'whatsapp') return <MessageCircle className="h-4 w-4" />;
        return <MessageSquare className="h-4 w-4" />;
      case 'task':
        return <CheckSquare className="h-4 w-4" />;
      case 'note':
        return <StickyNote className="h-4 w-4" />;
      case 'phase_change':
        return <ArrowRight className="h-4 w-4" />;
      case 'reminder':
        return <Bell className="h-4 w-4" />;
      case 'upload':
        return <FileText className="h-4 w-4" />;
    }
  };

  const getItemColor = (type: TimelineItem['type'], status?: string, metadata?: any) => {
    switch (type) {
      case 'contact_created':
        return 'text-green-500';
      case 'message':
        return 'text-white';
      case 'task':
        return metadata?.meetingType === 'appointment' ? 'text-[#40E0D0]' : 'text-[#FFA500]';
      case 'note':
        return 'text-[#008000]';
      case 'phase_change':
        return 'text-orange-500';
      case 'reminder':
        return 'text-red-500';
      case 'upload':
        return 'text-gray-500';
    }
  };

  const formatDate = (date: string) => {
    return format(new Date(date), "EEE. dd.MM.yyyy | HH:mm 'Uhr'", { locale: de });
  };

  return (
    <Card className="p-4">
      <h3 className="text-lg font-semibold mb-4">Aktivitäten</h3>
      <div className="space-y-4">
        {timelineItems.map((item) => (
          <div key={item.id} className="flex gap-4 items-start group hover:bg-muted/50 p-2 rounded-lg transition-colors">
            <div className={`mt-1 ${getItemColor(item.type, item.status, item.metadata)}`}>
              {getIcon(item.type, item.platform)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm text-muted-foreground mb-1">
                {formatDate(item.timestamp)}
              </div>
              <div className="text-sm break-words">
                {item.content}
              </div>
            </div>
          </div>
        ))}
        {timelineItems.length === 0 && (
          <div className="text-center text-muted-foreground py-4">
            Noch keine Aktivitäten vorhanden
          </div>
        )}
      </div>
    </Card>
  );
};