import React from 'react';
import { TimelineItemType } from "./TimelineUtils";
import { Check, AlertCircle, Info, Minus, X, Plus } from "lucide-react";

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
  const getIcon = () => {
    if (type === 'status_change') {
      return Info;
    }
    if (type === 'task') {
      return status === 'completed' ? Check : Plus;
    }
    if (type === 'appointment') {
      return status === 'cancelled' ? X : AlertCircle;
    }
    if (type === 'note') {
      return AlertCircle;
    }
    if (type === 'phase_change') {
      return Minus;
    }
    return AlertCircle; // Default icon
  };

  const getBackgroundColor = () => {
    if (type === 'status_change') {
      return 'bg-blue-500';
    }
    if (type === 'task') {
      return status === 'completed' ? 'bg-green-500' : 'bg-yellow-500';
    }
    if (type === 'appointment') {
      return status === 'cancelled' ? 'bg-red-500' : 'bg-orange-500';
    }
    return 'bg-gray-500'; // Default background
  };

  const Icon = getIcon();
  const backgroundColor = getBackgroundColor();

  return (
    <div className={`z-10 flex items-center justify-center w-8 h-8 rounded-full ${backgroundColor}`}>
      <Icon className="h-4 w-4 text-white" />
    </div>
  );
};
