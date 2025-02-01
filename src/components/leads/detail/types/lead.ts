import { Tables } from "@/integrations/supabase/types";
import { Platform } from "@/config/platforms";

export type Note = {
  id: string;
  content: string;
  created_at: string;
  metadata?: {
    type?: string;
    oldStatus?: string;
    newStatus?: string;
  };
  status?: string;
};

export type PostType = "image" | "video" | "carousel" | "text" | "sidecar" | "post";

export type SocialMediaPost = {
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
  media_urls: string[];
  media_type?: string;
  video_url?: string;
  bucket_path?: string;
  current_file?: string;
  engagement_count?: number;
  error_message?: string;
  first_comment?: string;
  hashtags?: string[];
  local_media_paths?: string[];
  local_media_urls?: string[];
  local_video_path?: string;
  media_count?: number;
  media_processing_status?: string;
  processing_progress?: number;
  storage_status?: string;
  tagged_users?: any[];
  timestamp?: string;
  caption?: string;
  location?: string;
};

export interface LeadWithRelations extends Omit<Tables<"leads">, "notes" | "social_media_posts"> {
  notes: Note[];
  tasks?: Tables<"tasks">[];
  messages?: Tables<"messages">[];
  lead_files?: Tables<"lead_files">[];
  linkedin_posts?: Tables<"linkedin_posts">[];
  social_media_posts?: SocialMediaPost[];
}