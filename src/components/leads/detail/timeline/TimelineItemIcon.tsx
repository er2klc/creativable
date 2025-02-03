import React from 'react';
import { TimelineItemType } from "./TimelineUtils";
import { getTimelineIcon } from "./utils/iconUtils";
import { getIconBackgroundColor } from "./utils/colorUtils";

interface TimelineItemIconProps {
  type: TimelineItemType;
  status?: string;
  platform?: string;
  metadata?: {
    type?: string;
    oldStatus?: string;
    newStatus?: string;
    meetingType?: string;
  };
}

export const TimelineItemIcon = ({ 
  type, 
  status, 
  platform, 
  metadata 
}: TimelineItemIconProps) => {
  const { icon: Icon } = getTimelineIcon(type, status, platform, metadata);
  const backgroundColor = getIconBackgroundColor(type, status, metadata);

  return (
    <div className={`z-10 flex items-center justify-center w-8 h-8 rounded-full ${backgroundColor}`}>
      <Icon className="h-4 w-4 text-white" />
    </div>
  );
};