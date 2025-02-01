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

export type SocialMediaPostRaw = Overwrite<Tables<"social_media_posts">, {
  post_type: PostType;
}>;

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
  level: number | null;
  avatar_url?: string | null;
  experience?: Json;
  education_summary?: string | null;
  social_media_stats?: Json;
  social_media_posts_count?: number | null;
  social_media_tagged_users?: Json;
  social_media_mentioned_users?: Json;
}>;