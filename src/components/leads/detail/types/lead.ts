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

export type SocialMediaPost = {
  id: string;
  user_id: string;
  lead_id: string;
  platform: string;
  post_type: string;
  content?: string;
  likes_count?: number;
  comments_count?: number;
  url?: string;
  location?: string;
  mentioned_profiles?: string[];
  tagged_profiles?: string[];
  posted_at?: string;
  created_at?: string;
  metadata?: any;
  tagged_users?: any[];
  media_urls?: string[];
  media_type?: string;
  first_comment?: string;
  engagement_count?: number;
  video_url?: string;
  hashtags?: string[];
};

export interface LeadWithRelations extends Omit<Tables<"leads">, "notes" | "social_media_posts"> {
  platform: Platform;
  messages: Tables<"messages">[];
  tasks: Tables<"tasks">[];
  notes: Note[];
  lead_files: Tables<"lead_files">[];
  social_media_posts?: SocialMediaPost[];
  linkedin_posts?: Tables<"linkedin_posts">[];
}