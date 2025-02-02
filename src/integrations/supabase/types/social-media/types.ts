import { Json } from '../json';
import { PostType } from '../enums';

export interface RawSocialMediaPost {
  id: string;
  lead_id: string;
  platform: string;
  post_type: PostType;
  content: string | null;
  url: string | null;
  posted_at?: string | null;
  media_urls?: string[];
  media_type?: string | null;
  likes_count?: number;
  comments_count?: number;
  video_url?: string | null;
  caption?: string | null;
  location?: string | null;
  hashtags?: string[];
  tagged_users?: any[];
  timestamp?: string | null;
  bucket_path?: string | null;
  engagement_count?: number | null;
  first_comment?: string | null;
  error_message?: string | null;
  current_file?: string | null;
}

export interface ApifyPost {
  id: string;
  videoUrl?: string;
  caption?: string;
  url?: string;
  timestamp?: string;
  likesCount?: number;
  commentsCount?: number;
}