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
  caption: string | null;
  likes_count: number | null;
  comments_count: number | null;
  url: string | null;
  location: string | null;
  mentioned_profiles: string[] | null;
  tagged_profiles: string[] | null;
  posted_at: string | null;
  media_urls: string[];
  media_type: string | null;
  video_url: string | null;
  hashtags: string[] | null;
  tagged_users: any[] | null;
  timestamp: string | null;
}

export interface LeadWithRelations extends Omit<Tables<"leads">, "notes"> {
  platform: Platform;
  notes: Note[];
  tasks?: Tables<"tasks">[];
  messages?: Tables<"messages">[];
  lead_files?: Tables<"lead_files">[];
  linkedin_posts?: Tables<"linkedin_posts">[];
  social_media_posts?: SocialMediaPost[];
}