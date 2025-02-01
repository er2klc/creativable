import { Platform } from "@/config/platforms";
import { Tables } from "@/integrations/supabase/types";
import { Json } from "@/integrations/supabase/types/auth";

export type PostType = "post" | "video" | "reel" | "story" | "igtv" | "Image" | "Sidecar";

export interface Note {
  id: string;
  content: string;
  created_at: string;
  metadata?: {
    type?: string;
  };
  status?: string;
  color?: string;
}

export interface Message {
  id: string;
  content: string;
  created_at: string;
  sent_at?: string;
  platform: string;
  lead_id: string;
  read: boolean;
  user_id: string;
}

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
  taggedUsers?: { username: string }[];
}

export interface LeadWithRelations extends Omit<Tables<"leads">, "notes" | "messages" | "social_media_posts"> {
  messages: Message[];
  tasks: Tables<"tasks">[];
  notes: Note[];
  lead_files: Tables<"lead_files">[];
  linkedin_posts?: any[];
  platform: Platform;
  social_media_posts?: SocialMediaPostRaw[];
}