export interface SocialMediaStats {
  bio?: string;
  followers?: number;
  following?: number;
  posts?: number;
  connections?: number;
  isPrivate?: boolean;
  headline?: string;
}

export interface SocialMediaPost {
  id: string;
  platform: string;
  post_type: 'post' | 'video' | 'reel' | 'story' | 'igtv';
  content?: string;
  likes_count?: number;
  comments_count?: number;
  url?: string;
  location?: string;
  mentioned_profiles?: string[];
  tagged_profiles?: string[];
  posted_at?: string;
  metadata?: any;
  media_urls?: string[];
  media_type?: string;
  engagement_count?: number;
  video_url?: string;
  hashtags?: string[];
}