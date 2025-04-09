
import React from 'react';
import { TimelineItemType } from './TimelineUtils';
import { formatDate } from '@/lib/utils';
import { useSettings } from '@/hooks/use-settings';
import { TimelineItemIcon } from './TimelineItemIcon';
import { TimelineItemCard } from './TimelineItemCard';

interface TimelineItemProps {
  item: {
    id: string;
    type: TimelineItemType;
    content: string;
    timestamp: string;
    metadata?: any;
    status?: string;
    platform?: string;
  };
  onDelete?: (noteId: string) => void;
  onToggleTaskComplete?: (id: string, completed: boolean) => void;
  leadName?: string;
}

export const TimelineItem: React.FC<TimelineItemProps> = ({ 
  item, 
  onDelete,
  onToggleTaskComplete,
  leadName
}) => {
  const { settings } = useSettings();
  
  return (
    <div className="flex gap-4 relative z-10">
      <div className="flex flex-col items-center">
        <TimelineItemIcon 
          type={item.type} 
          status={item.status} 
          platform={item.platform}
          metadata={item.metadata}
        />
      </div>
      
      <div className="flex-1">
        <div className="text-xs text-gray-500 mb-1">
          {formatDate(item.timestamp, settings?.language === "en" ? "PPpp" : "PPpp")}
        </div>
        <TimelineItemCard
          type={item.type}
          content={item.content}
          metadata={item.metadata}
          status={item.status}
          onDelete={onDelete ? () => onDelete(item.id) : undefined}
          id={item.id}
          created_at={item.timestamp}
          isCompleted={item.status === 'completed'}
          onToggleComplete={onToggleTaskComplete}
          timestamp={item.timestamp}
        />
      </div>
    </div>
  );
};
