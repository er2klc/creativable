import { Json } from "@/integrations/supabase/types";
import { Tables } from "@/integrations/supabase/types";
import { Platform } from "@/config/platforms";

export interface LeadWithRelations extends Tables<"leads"> {
  messages: Tables<"messages">[];
  tasks: Tables<"tasks">[];
  notes: Tables<"notes">[];
  lead_files: Tables<"lead_files">[];
  linkedin_posts?: any[];
  social_media_posts?: SocialMediaPost[];
  platform: Platform;
}

export interface SocialMediaPost {
  id: string;
  lead_id: string;
  platform: string;
  post_type: string;
  content: string | null;
  url: string | null;
  posted_at?: string | null;
  created_at?: string;
  media_urls?: string[];
  media_type?: string | null;
  likes_count?: number | null;
  comments_count?: number | null;
  location?: string | null;
  hashtags?: string[] | null;
  tagged_users?: any[] | null;
  caption?: string | null;
  video_url?: string | null;
}