import React from 'react';
import { TimelineItemType } from "./TimelineUtils";
import { Check, X, Pause, Minus, Calendar, MessageSquare, FileText, UserPlus } from "lucide-react";

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
    if (type === 'status_change' && metadata?.newStatus) {
      switch(metadata.newStatus) {
        case 'partner':
          return <Check className="h-4 w-4 text-white" />;
        case 'customer':
          return <Check className="h-4 w-4 text-white" />;
        case 'not_for_now':
          return <Pause className="h-4 w-4 text-white" />;
        case 'no_interest':
          return <X className="h-4 w-4 text-white" />;
        default:
          return <Minus className="h-4 w-4 text-white" />;
      }
    }

    switch(type) {
      case 'message':
        return <MessageSquare className="h-4 w-4 text-white" />;
      case 'file_upload':
        return <FileText className="h-4 w-4 text-white" />;
      case 'contact_created':
        return <UserPlus className="h-4 w-4 text-white" />;
      default:
        return <Calendar className="h-4 w-4 text-white" />;
    }
  };

  const getBackgroundColor = () => {
    if (type === 'status_change' && metadata?.newStatus) {
      switch(metadata.newStatus) {
        case 'partner':
          return 'bg-[#8B5CF6]';
        case 'customer':
          return 'bg-[#FEC6A1]';
        case 'not_for_now':
          return 'bg-[#8E9196]';
        case 'no_interest':
          return 'bg-[#ea384c]';
        default:
          return 'bg-gray-500';
      }
    }

    return 'bg-blue-500';
  };

  return (
    <div className={`z-10 flex items-center justify-center w-8 h-8 rounded-full ${getBackgroundColor()}`}>
      {getIcon()}
    </div>
  );
};