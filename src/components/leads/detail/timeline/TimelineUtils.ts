
export type TimelineItemType = 
  | 'message' 
  | 'note' 
  | 'task' 
  | 'appointment' 
  | 'phase_change' 
  | 'status_change' 
  | 'file_upload' 
  | 'contact_created'
  | 'youtube'
  | 'business_match'
  | 'facebook'
  | 'instagram'
  | 'linkedin'
  | 'tiktok';

export interface TimelineItem {
  id: string;
  type: TimelineItemType;
  content: string;
  timestamp: string;
  status?: string;
  platform?: string;
  metadata?: any;
}

export const getTimelineItemTypeColor = (type: TimelineItemType, status?: string): string => {
  switch (type) {
    case 'message':
      return 'bg-blue-500';
    case 'note':
      return 'bg-yellow-500';
    case 'task':
      return status === 'completed' ? 'bg-green-500' : 'bg-cyan-500';
    case 'appointment':
      return status === 'cancelled' ? 'bg-gray-400' : 'bg-orange-500';
    case 'phase_change':
      return 'bg-purple-500';
    case 'status_change':
      return 'bg-red-500';
    case 'youtube':
      return 'bg-red-600';
    case 'business_match':
      return 'bg-blue-600';
    case 'file_upload':
      return 'bg-blue-500';
    case 'contact_created':
      return 'bg-emerald-500';
    case 'facebook':
      return 'bg-blue-600';
    case 'instagram':
      return 'bg-pink-500';
    case 'linkedin':
      return 'bg-blue-800';
    case 'tiktok':
      return 'bg-black';
    default:
      return 'bg-gray-500';
  }
};
