import { Tables } from "@/integrations/supabase/types";
import { Platform } from "@/config/platforms";

export type PostType = "image" | "video" | "carousel" | "text";

export interface Note {
  id: string;
  content: string;
  created_at: string;
  metadata?: {
    type?: string;
    oldStatus?: string;
    newStatus?: string;
  };
  status?: string;
}

export interface SocialMediaPost {
  id: string;
  user_id: string;
  lead_id: string;
  platform: string;
  post_type: PostType;
  content: string | null;
  likes_count: number | null;
  comments_count: number | null;
  url: string | null;
  posted_at: string | null;
  created_at: string | null;
  media_urls: string[];
  media_type: string | null;
  video_url: string | null;
  bucket_path: string | null;
  current_file: string | null;
  engagement_count: number | null;
  error_message: string | null;
  first_comment: string | null;
  hashtags: string[] | null;
  local_media_paths: string[] | null;
  local_media_urls: string[] | null;
  local_video_path: string | null;
  media_count: number | null;
  media_processing_status: string | null;
  processing_progress: number | null;
  storage_status: string | null;
  tagged_users: any[] | null;
  timestamp: string | null;
  caption: string | null;
  location: string | null;
}

export interface LeadWithRelations extends Omit<Tables<"leads">, "notes" | "social_media_posts"> {
  platform: Platform;
  notes: Note[];
  tasks?: Tables<"tasks">[];
  messages?: Tables<"messages">[];
  lead_files?: Tables<"lead_files">[];
  linkedin_posts?: Tables<"linkedin_posts">[];
  social_media_posts?: SocialMediaPost[];
}