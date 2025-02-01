import { Tables } from "@/integrations/supabase/types";
import { Platform } from "@/config/platforms";
import { Note } from "@/components/leads/detail/types/lead";

export type PostType = "post" | "video" | "reel" | "story" | "igtv" | "Image" | "Sidecar";

export interface SocialMediaPost {
  id: string;
  lead_id: string;
  platform: string;
  type: string;
  post_type: PostType;
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
  video_url: string | null;
  videoUrl?: string | null;
  images?: string[] | null;
  hashtags?: string[] | null;
  likes_count?: number | null;
  comments_count?: number | null;
  taggedUsers?: any[];
  first_comment?: string | null;
  engagement_count?: number | null;
  bucket_path?: string | null;
  media_processing_status?: string;
  processing_progress?: number;
  error_message?: string | null;
  current_file?: string | null;
  local_media_urls?: string[] | null;
  storage_status?: string;
  media_count?: number;
  local_video_path: string | null;
  local_media_paths: string[] | null;
}

export type LeadWithRelations = Tables<"leads"> & {
  platform: Platform;
  messages: Tables<"messages">[];
  tasks: Tables<"tasks">[];
  notes: Note[];
  lead_files: Tables<"lead_files">[];
  parent_id?: string | null;
  level?: number | null;
  avatar_url?: string | null;
  social_media_posts?: SocialMediaPost[];
};