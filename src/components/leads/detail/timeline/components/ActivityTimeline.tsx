
import { useState } from "react";
import { TimelineItem } from "../TimelineItem";
import { TimelineFilterButton } from "./TimelineFilterButton";

// List of available filters
const FILTERS = ["all", "notes", "tasks", "messages", "files"];

// Type for timeline item filter
type TimelineFilter = "all" | "notes" | "tasks" | "messages" | "files";

interface ActivityTimelineProps {
  items: any[];
  onDeletePhaseChange?: (noteId: string) => void;
  onToggleTaskComplete?: (id: string, completed: boolean) => void;
}

export const ActivityTimeline = ({ 
  items, 
  onDeletePhaseChange,
  onToggleTaskComplete
}: ActivityTimelineProps) => {
  const [filter, setFilter] = useState<TimelineFilter>("all");

  // Filter items based on selected filter
  const filteredItems = items.filter(item => {
    if (filter === "all") return true;
    if (filter === "notes") return item.type === "note" || item.type === "phase_change";
    if (filter === "tasks") return item.type === "task";
    if (filter === "messages") return item.type === "message";
    if (filter === "files") return item.type === "file_upload";
    return true;
  });

  if (!items.length) {
    return (
      <div className="p-4 bg-white rounded-lg shadow text-center">
        <p className="text-gray-500">Keine Aktivitäten vorhanden</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {FILTERS.map(f => (
          <TimelineFilterButton
            key={f}
            label={f}
            isActive={filter === f}
            onClick={() => setFilter(f as TimelineFilter)}
          />
        ))}
      </div>

      <div className="space-y-6">
        {filteredItems.map(item => (
          <TimelineItem
            key={item.id}
            item={item}
            onDelete={
              (item.type === "phase_change" || item.type === "note") && onDeletePhaseChange
                ? onDeletePhaseChange
                : undefined
            }
            onToggleTaskComplete={
              item.type === "task" && onToggleTaskComplete
                ? onToggleTaskComplete
                : undefined
            }
          />
        ))}
      </div>
    </div>
  );
};
