import { TimelineItemType } from "../TimelineUtils";

export const getIconBackgroundColor = (
  type: TimelineItemType,
  status?: string,
  metadata?: {
    type?: string;
    newStatus?: string;
  }
): string => {
  if (type === 'phase_change' && metadata?.type === 'status_change') {
    switch(metadata.newStatus) {
      case 'partner': return 'bg-[#8B5CF6]';
      case 'customer': return 'bg-[#D946EF]';
      case 'not_for_now': return 'bg-[#F2FCE2]';
      case 'no_interest': return 'bg-[#ea384c]';
      default: return 'bg-gray-500';
    }
  }

  switch (type) {
    case 'contact_created':
      return 'bg-green-500';
    case 'message':
      return 'bg-blue-500';
    case 'task':
      return status === 'completed' ? 'bg-green-500' : 'bg-cyan-500';
    case 'appointment':
      return status === 'cancelled' ? 'bg-red-500' : 'bg-orange-500';
    case 'note':
      return 'bg-yellow-500';
    case 'phase_change':
      return 'bg-purple-500';
    case 'reminder':
      return 'bg-red-500';
    case 'file_upload':
      return 'bg-gray-500';
    case 'presentation':
      return 'bg-indigo-500';
    default:
      return 'bg-gray-500';
  }
};