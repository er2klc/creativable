import { Tables } from "@/integrations/supabase/types";

export type PostType = 'post' | 'story' | 'reel' | 'igtv';

export interface Note {
  id: string;
  content: string;
  created_at: string;
  metadata?: {
    type?: string;
    oldPhase?: string;
    newPhase?: string;
  };
}

export interface SocialMediaPostRaw {
  id: string;
  lead_id: string;
  platform: string;
  post_type: PostType;
  content: string;
  likes_count?: number;
  comments_count?: number;
  url: string;
  posted_at: string;
  created_at: string;
  metadata?: any;
  tagged_users?: any[];
  media_urls: string[];
  media_type: string;
  first_comment?: string;
  engagement_count?: number;
  video_url?: string;
  hashtags?: string[];
  local_video_path?: string;
  local_media_paths?: string[];
  bucket_path?: string;
  media_processing_status?: string;
  processing_progress?: number;
  error_message?: string;
  current_file?: string;
  local_media_urls?: string[];
  storage_status?: string;
  media_count?: number;
  location?: string;
  mentioned_profiles?: string[];
  tagged_profiles?: string[];
}

export interface LeadWithRelations extends Tables<"leads"> {
  notes: Note[];
  messages?: Tables<"messages">[];
  tasks?: Tables<"tasks">[];
  lead_files?: Tables<"lead_files">[];
  linkedin_posts?: any[];
  social_media_posts?: SocialMediaPostRaw[];
}