import { Platform } from "@/config/platforms";
import { Tables } from "@/integrations/supabase/types";

export type PostType = 'image' | 'video' | 'carousel' | 'Sidecar' | 'post';

export interface SocialMediaPostRaw {
  id: string;
  platform?: string;
  type?: string;
  post_type?: PostType;
  content: string;
  caption?: string;
  likesCount?: number;
  commentsCount?: number;
  likes_count?: number;
  comments_count?: number;
  url?: string;
  location?: string;
  locationName?: string;
  mentioned_profiles?: string[];
  tagged_profiles?: string[];
  posted_at?: string;
  timestamp?: string;
  media_urls?: string[];
  media_type?: string;
  video_url?: string;
  local_video_path?: string;
  local_media_paths?: string[];
  hashtags?: string[] | null;
}

export interface Note {
  id: string;
  content: string;
  created_at: string;
  color?: string;
  metadata?: any;
}

export interface Message {
  id: string;
  content: string;
  created_at: string;
  platform: string;
  sent_at?: string;
  read: boolean;
  lead_id: string;
  user_id: string;
}

export interface LeadWithRelations extends Omit<Tables<"leads">, "notes"> {
  messages: Message[];
  tasks: Tables<"tasks">[];
  notes: Note[];
  lead_files: Tables<"lead_files">[];
  platform: Platform;
  parent_id?: string | null;
  level?: number | null;
  avatar_url?: string | null;
  social_media_posts?: any[];
}