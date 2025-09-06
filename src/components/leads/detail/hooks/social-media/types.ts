import { Json } from "@/integrations/supabase/types";
import { SocialMediaPost, PostType } from "@/types/leads";

export interface RawSocialMediaPost {
  id: string;
  lead_id: string;
  user_id: string;
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
  tagged_users?: any[] | null;
  timestamp?: string | null;
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