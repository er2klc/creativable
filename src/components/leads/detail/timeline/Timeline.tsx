
import React from 'react';
import { TimelineItem } from './TimelineItem';
import { TimelineItemType } from '../../../leads/detail/timeline/TimelineUtils';

interface TimelineProps {
  items: {
    id: string;
    type: TimelineItemType;
    content: string;
    timestamp: string;
    metadata?: any;
    status?: string;
    platform?: string;
  }[];
  onDeletePhaseChange?: (noteId: string) => void;
}

export const Timeline: React.FC<TimelineProps> = ({ items, onDeletePhaseChange }) => {
  if (!items || items.length === 0) {
    return (
      <div className="text-center text-gray-500 my-8">
        No timeline items found.
      </div>
    );
  }

  return (
    <div className="relative space-y-6">
      <div className="absolute left-4 top-0 bottom-0 w-[2px] bg-gray-300 z-0" />
      
      {items.map((item) => (
        <TimelineItem 
          key={item.id} 
          item={item} 
          onDelete={
            item.type === "phase_change" || item.type === "note" 
              ? onDeletePhaseChange 
              : undefined
          }
        />
      ))}
    </div>
  );
};
