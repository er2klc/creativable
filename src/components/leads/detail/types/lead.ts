import { Tables } from "@/integrations/supabase/types";
import { Platform } from "@/config/platforms";

export type LeadWithRelations = Tables<"leads"> & {
  messages: Tables<"messages">[];
  tasks: Tables<"tasks">[];
  notes: Tables<"notes">[];
  lead_files: Tables<"lead_files">[];
  social_media_posts?: any[];
  linkedin_posts?: Tables<"linkedin_posts">[];
  platform: Platform;
};

export interface SocialMediaPostRaw {
  id: string;
  lead_id?: string;
  platform: string;
  post_type: "post" | "video" | "reel" | "story" | "igtv" | "Image" | "Sidecar";
  content: string | null;
  likes_count?: number | null;
  comments_count?: number | null;
  url: string | null;
  posted_at: string | null;
  media_urls: string[] | null;
  media_type: string | null;
  video_url?: string | null;
}