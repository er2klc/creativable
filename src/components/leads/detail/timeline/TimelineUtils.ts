export interface TimelineItem {
  id: string;
  type: 'note' | 'task' | 'message' | 'phase_change' | 'file_upload' | 'contact_created' | 'linkedin_post';
  content: string;
  created_at: string;
  timestamp: string;
  platform?: string;
  metadata?: {
    type?: string;
    dueDate?: string;
    fileName?: string;
    fileType?: string;
    fileSize?: number;
    filePath?: string;
    status?: 'completed' | 'cancelled' | 'outdated';
    completedAt?: string;
    cancelledAt?: string;
    updatedAt?: string;
    oldDate?: string;
    newDate?: string;
    oldStatus?: string;
    newStatus?: string;
    likes_count?: number;
    comments_count?: number;
    shares_count?: number;
    media_urls?: string[];
    reactions?: Record<string, any>;
  };
}

export interface SocialMediaPostRaw {
  id: string;
  platform: string;
  type: string;
  post_type?: string;
  content: string | null;
  caption: string | null;
  likesCount: number | null;
  commentsCount: number | null;
  url: string | null;
  location: string | null;
  locationName?: string | null;
  mentioned_profiles: string[] | null;
  tagged_profiles: string[] | null;
  posted_at: string | null;
  timestamp: string | null;
  media_urls: string[] | null;
  media_type: string | null;
  local_video_path: string | null;
  local_media_paths: string[] | null;
  video_url: string | null;
  videoUrl?: string | null;
  images?: string[] | null;
  hashtags?: string[] | null;
  school?: string | null;
  degree?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  school_linkedin_url?: string | null;
  company?: string | null;
  position?: string | null;
  location_name?: string | null;
  reactions?: Record<string, any>;
  metadata?: Record<string, any>;
}

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('de-DE', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};