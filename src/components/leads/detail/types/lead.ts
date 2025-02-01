import { Tables } from "@/integrations/supabase/types";
import { Platform } from "@/config/platforms";
import { Json } from "@/integrations/supabase/types/auth";

// Helper type: Overwrites in T all properties that are defined in U
export type Overwrite<T, U> = Omit<T, keyof U> & U;

export type Message = Tables<"messages">;
export type Note = Tables<"notes">;
export type Task = Tables<"tasks">;
export type LeadFile = Tables<"lead_files">;
export type LinkedInPost = Tables<"linkedin_posts">;

export type PostType = "post" | "video" | "reel" | "story" | "igtv" | "Image" | "Sidecar" | "experience" | "education";

// Extend the base social media post type from Supabase
export type SocialMediaPostRaw = Tables<"social_media_posts"> & {
  post_type: PostType;
  posted_at?: string | null;
  timestamp?: string | null;
  caption?: string | null;
  likesCount?: number;
  commentsCount?: number;
  videoUrl?: string;
  type?: string;
  tagged_users?: Json;
  media_urls?: string[];
  local_media_paths?: string[];
  bucket_path?: string | null;
  media_processing_status?: string;
  processing_progress?: number;
  error_message?: string | null;
  current_file?: string | null;
};

// Important: We extend the base lead type from Supabase and override specific properties
export type LeadWithRelations = Overwrite<Tables<"leads">, {
  platform: Platform;
  messages: Message[];
  tasks: Task[];
  notes: Note[];
  lead_files: LeadFile[];
  social_media_posts?: SocialMediaPostRaw[];
  linkedin_posts?: LinkedInPost[];
  parent_id?: string | null;
  level?: number | null;
  avatar_url?: string | null;
  experience?: Json;
  education_summary?: string | null;
  social_media_stats?: Json;
  social_media_posts_count?: number | null;
  social_media_tagged_users?: Json;
  social_media_mentioned_users?: Json;
  archive_reason?: string | null;
  birth_date?: string | null;
  city?: string | null;
  company_name?: string | null;
  contact_type?: string | null;
  created_at?: string | null;
  current_company_name?: string | null;
  email?: string | null;
  website?: string | null;
  onboarding_progress?: Json;
  social_media_username?: string | null;
  social_media_bio?: string | null;
  social_media_followers?: number | null;
  social_media_following?: number | null;
  social_media_engagement_rate?: number | null;
  social_media_last_post_date?: string | null;
  social_media_categories?: string[] | null;
  social_media_verified?: boolean;
  social_media_profile_image_url?: string | null;
  linkedin_id?: string | null;
  position?: string | null;
  region?: string | null;
  languages?: string[] | null;
  next_steps?: Json;
  follow_up_date?: string | null;
  last_interaction_date?: string | null;
  network_marketing_id?: string | null;
  pipeline_id?: string;
  phase_id?: string;
  status?: string;
  industry?: string;
  notes_text?: string;
}>;