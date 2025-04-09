
import { useState, useEffect } from "react";
import { useSession } from "@supabase/auth-helpers-react";
import { format, formatDistanceToNow } from "date-fns";
import { de } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";
import { useSettings } from "@/hooks/use-settings";
import { LeadWithRelations } from "@/types/leads";
import { Timeline } from "./timeline/Timeline";
import { TimelineItem, TimelineItemType } from "./timeline/TimelineUtils";
import { EmptyTimeline } from "./timeline/EmptyTimeline";
import { useLeadActivities } from "@/hooks/use-lead-activities";

interface LeadTimelineProps {
  lead: LeadWithRelations;
  onDeletePhaseChange?: (noteId: string) => void;
}

export const LeadTimeline = ({ lead, onDeletePhaseChange }: LeadTimelineProps) => {
  const { settings } = useSettings();
  const session = useSession();
  const [timelineItems, setTimelineItems] = useState<TimelineItem[]>([]);
  const { activities, isLoading } = useLeadActivities(lead.id);

  useEffect(() => {
    if (!lead) return;

    // Combine all types of activities into timeline items
    const items: TimelineItem[] = [];

    // Add messages
    if (lead.messages) {
      lead.messages.forEach((message) => {
        items.push({
          id: message.id,
          type: "message" as TimelineItemType,
          content: message.content || "",
          timestamp: message.created_at,
          platform: lead.platform || undefined,
          metadata: {
            sender: message.sender || "user",
            receiver: message.receiver || "lead",
          },
        });
      });
    }

    // Add tasks
    if (lead.tasks) {
      lead.tasks.forEach((task) => {
        items.push({
          id: task.id,
          type: "task" as TimelineItemType,
          content: task.content || "",
          timestamp: task.created_at,
          status: task.completed ? "completed" : "open",
          metadata: {
            due_date: task.due_date,
            completed_at: task.completed_at,
            priority: task.priority,
          },
        });
      });
    }

    // Add notes
    if (lead.notes) {
      lead.notes.forEach((note) => {
        items.push({
          id: note.id,
          type: "note" as TimelineItemType,
          content: note.content || "",
          timestamp: note.created_at,
          metadata: {
            last_edited_at: note.updated_at,
            created_at: note.created_at,
          },
        });
      });
    }

    // Add activities
    if (activities) {
      activities.forEach((activity) => {
        // Check if activity is phase change
        if (activity.type === "phase_change") {
          items.push({
            id: activity.id,
            type: "phase_change" as TimelineItemType,
            content: activity.content || "",
            timestamp: activity.created_at,
            metadata: {
              type: activity.metadata?.type || "phase_change",
              oldPhase: activity.metadata?.old_phase,
              newPhase: activity.metadata?.new_phase,
              oldStatus: activity.metadata?.old_status,
              newStatus: activity.metadata?.new_status,
            },
          });
        }
      });
    }

    // Sort by timestamp in descending order (newest first)
    items.sort((a, b) => {
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    });

    setTimelineItems(items);
  }, [lead, activities]);

  if (isLoading) {
    return (
      <div className="py-8 text-center text-sm text-gray-500">
        {settings?.language === "en" ? "Loading timeline..." : "Timeline wird geladen..."}
      </div>
    );
  }

  if (timelineItems.length === 0) {
    return <EmptyTimeline leadId={lead.id} />;
  }

  return (
    <div className="mt-6">
      <h3 className="text-lg font-medium mb-4">
        {settings?.language === "en" ? "Timeline" : "Zeitleiste"}
      </h3>
      <Timeline items={timelineItems} onDeletePhaseChange={onDeletePhaseChange} />
    </div>
  );
};
