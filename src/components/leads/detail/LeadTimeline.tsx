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
  UserPlus,
  Check,
  Circle
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Platform } from "@/config/platforms";
import { Button } from "@/components/ui/button";

type TimelineItem = {
  id: string;
  type: "message" | "task" | "note" | "phase_change" | "reminder" | "upload" | "contact_created";
  content: string;
  timestamp: string;
  status?: string;
  platform?: string;
  metadata?: {
    dueDate?: string;
    meetingType?: string;
    color?: string;
  };
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
        return <Calendar className="h-4 w-4" />;
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
        return 'bg-green-100 border-green-200';
      case 'message':
        return 'bg-blue-100 border-blue-200';
      case 'task':
        return metadata?.meetingType === 'appointment' ? 'bg-cyan-100 border-cyan-200' : 'bg-orange-100 border-orange-200';
      case 'note':
        return 'bg-yellow-100 border-yellow-200';
      case 'phase_change':
        return 'bg-purple-100 border-purple-200';
      case 'reminder':
        return 'bg-red-100 border-red-200';
      case 'upload':
        return 'bg-gray-100 border-gray-200';
    }
  };

  const formatDate = (date: string) => {
    return format(new Date(date), "EEE. dd.MM.yyyy | HH:mm 'Uhr'", { locale: de });
  };

  return (
    <div className="p-4">
      <h3 className="text-lg font-semibold mb-4">Aktivitäten</h3>
      <div className="relative space-y-4">
        {/* Vertical Timeline Line */}
        <div className="absolute left-2 top-2 bottom-2 w-0.5 bg-gray-200" />
        
        {timelineItems.map((item) => (
          <div key={item.id} className="flex gap-4 items-start group relative">
            {/* Circle with Icon */}
            <div className={`z-10 flex items-center justify-center w-4 h-4 rounded-full bg-white border-2 border-gray-300`}>
              <div className="w-2 h-2 rounded-full bg-gray-300" />
            </div>
            
            {/* Connecting Line */}
            <div className="absolute left-4 top-2 w-4 h-0.5 bg-gray-200" />
            
            {/* Event Card */}
            <div className={`flex-1 min-w-0 p-4 rounded-lg transition-all cursor-pointer hover:shadow-md ${getItemColor(item.type, item.status, item.metadata)}`}>
              <div className="flex items-center gap-2 mb-1">
                <div className={`text-gray-600`}>
                  {getIcon(item.type, item.platform)}
                </div>
                <div className="text-sm text-gray-600">
                  {formatDate(item.timestamp)}
                </div>
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
    </div>
  );
};