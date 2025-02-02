import { Tables } from "@/integrations/supabase/types";

export type Note = Tables<"notes">;
export type Task = Tables<"tasks">;
export type Message = Tables<"messages">;
export type LeadFile = Tables<"lead_files">;
export type LinkedInPost = Tables<"linkedin_posts">;
export type SocialMediaPost = Tables<"social_media_posts">;

export interface LeadWithRelations extends Tables<"leads"> {
  notes: Note[];
  tasks: Task[];
  messages: Message[];
  lead_files: LeadFile[];
  linkedin_posts: LinkedInPost[];
  social_media_posts: SocialMediaPost[];
}