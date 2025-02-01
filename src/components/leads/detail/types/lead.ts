import { Tables } from "@/integrations/supabase/types";
import { Platform } from "@/config/platforms";

export type PostType = "post" | "video" | "reel" | "story" | "igtv" | "Image" | "Sidecar";

export interface TaggedUser {
  id: string;
  username: string;
  full_name?: string;
  profile_pic_url: string;
  is_verified?: boolean;
}

export interface SocialMediaPostRaw {
  id: string;
  platform?: string;
  type?: string;
  post_type: PostType;
  content: string;
  caption?: string | null;
  likesCount?: number | null;
  commentsCount?: number | null;
  likes_count?: number | null;
  comments_count?: number | null;
  url: string | null;
  location?: string | null;
  locationName?: string | null;
  mentioned_profiles?: string[] | null;
  tagged_profiles?: string[] | null;
  posted_at: string | null;
  timestamp?: string | null;
  media_urls: string[] | null;
  media_type: string | null;
  video_url?: string | null;
  videoUrl?: string | null;
  images?: string[] | null;
  hashtags?: string[] | null;
  lead_id?: string;
  taggedUsers?: TaggedUser[];
  local_video_path?: string | null;
  local_media_paths?: string[] | null;
  kontaktIdFallback?: string;
}

export interface LeadWithRelations extends Tables<"leads"> {
  messages: {
    id: string;
    content: string;
    created_at: string;
    sent_at?: string;
    platform?: string;
    lead_id: string;
    read: boolean;
    user_id: string;
  }[];
  tasks: {
    id: string;
    title: string;
    created_at: string;
    due_date?: string;
    completed?: boolean;
    cancelled?: boolean;
    updated_at?: string;
    color?: string;
    meeting_type?: string;
    lead_id: string;
    user_id: string;
  }[];
  notes: {
    id: string;
    content: string;
    created_at: string;
    metadata?: {
      type?: string;
    };
    status?: string;
    lead_id: string;
    user_id: string;
  }[];
  lead_files: {
    id: string;
    file_name: string;
    file_path: string;
    file_type: string;
    file_size: number;
    created_at: string;
    lead_id: string;
    user_id: string;
  }[];
  platform: Platform;
}