import { Tables } from "@/integrations/supabase/types";
import { Platform } from "@/config/platforms";
import { Json } from "@/integrations/supabase/types/auth";

export interface Message {
  id: string;
  content: string;
  lead_id: string | null;
  platform: string;
  read: boolean;
  sent_at: string | null;
  user_id: string;
  created_at: string;
}

export interface Note {
  id: string;
  content: string;
  lead_id: string;
  user_id: string;
  color?: string;
  created_at: string;
  updated_at: string | null;
  metadata?: Record<string, any>;
}

export type PostType = "post" | "video" | "reel" | "story" | "igtv" | "Image" | "Sidecar";

export interface SocialMediaPostRaw {
  id: string;
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
  local_video_path: string | null;
  local_media_paths: string[] | null;
  video_url: string | null;
  videoUrl?: string | null;
  images?: string[] | null;
  hashtags?: string[] | null;
  likes_count?: number | null;
  comments_count?: number | null;
  taggedUsers?: any[];
}

export type LeadWithRelations = Omit<Tables<"leads">, "notes" | "social_media_posts"> & {
  platform: Platform;
  messages: Message[];
  tasks: Tables<"tasks">[];
  notes: Note[];
  lead_files: Tables<"lead_files">[];
  social_media_posts?: SocialMediaPostRaw[];
  linkedin_posts?: Tables<"linkedin_posts">[];
};