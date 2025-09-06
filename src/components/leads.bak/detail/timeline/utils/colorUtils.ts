import { TimelineItemType } from "../TimelineUtils";

export const getIconBackgroundColor = (
  type: TimelineItemType,
  status?: string,
  metadata?: {
    type?: string;
    oldStatus?: string;
    newStatus?: string;
    meetingType?: string;
  }
): string => {
  if (type === 'phase_change' && metadata?.type === 'status_change') {
    switch(metadata.newStatus) {
      case 'partner': return 'bg-pink-500';
      case 'customer': return 'bg-green-500';
      case 'not_for_now': return 'bg-yellow-500';
      case 'no_interest': return 'bg-red-500';
      default: return 'bg-blue-500';
    }
  }

  switch (type) {
    case 'contact_created':
      return 'bg-emerald-500';
    case 'message':
      return 'bg-purple-500';
    case 'task':
      return status === 'completed' ? 'bg-green-500' : 'bg-orange-500';
    case 'appointment':
      return status === 'cancelled' ? 'bg-red-500' : 'bg-indigo-500';
    case 'note':
      return 'bg-yellow-400';
    case 'phase_change':
      return 'bg-blue-500';
    case 'file_upload':
      return 'bg-cyan-500';
    case 'reminder':
      return 'bg-pink-500';
    case 'presentation':
      return 'bg-violet-500';
    case 'upload':
      return 'bg-teal-500';
    default:
      return 'bg-gray-500';
  }
};