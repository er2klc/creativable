
import React from 'react';
import { TimelineItem } from '../TimelineItem';
import { formatTimelineData } from '../utils/timelineMappers';

interface ActivityTimelineProps {
  activities: any[];
  onDelete?: (noteId: string) => void;
  onToggleTaskComplete?: (id: string, completed: boolean) => void;
}

export const ActivityTimeline = ({ 
  activities, 
  onDelete,
  onToggleTaskComplete
}: ActivityTimelineProps) => {
  const timelineItems = formatTimelineData(activities);

  return (
    <div className="relative pl-10 py-4">
      {/* Vertikale gestrichelte Linie */}
      <div className="absolute left-4 top-2 bottom-2 w-[2px] bg-gray-400 border-l-2 border-dashed border-gray-400"></div>
      
      <div className="space-y-8">
        {timelineItems.map((item) => (
          <TimelineItem 
            key={item.id} 
            item={item} 
            onDelete={onDelete}
            onToggleTaskComplete={onToggleTaskComplete}
          />
        ))}
      </div>
    </div>
  );
};
