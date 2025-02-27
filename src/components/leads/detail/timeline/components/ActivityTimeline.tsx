
import { TimelineItem } from "../TimelineItem";

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
  if (!items.length) {
    return (
      <div className="p-4 bg-white rounded-lg shadow text-center">
        <p className="text-gray-500">Keine Aktivitäten vorhanden</p>
      </div>
    );
  }

  return (
    <div className="relative space-y-6">
      {/* Durchgehende vertikale Linie */}
      <div className="absolute left-4 top-0 bottom-0 w-[2px] bg-gray-400 h-full z-0" />
      
      {items.map(item => (
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
  );
};
