import { Tables } from "@/integrations/supabase/types";
import { Platform } from "@/config/platforms";

export type LeadWithRelations = Tables<"leads"> & {
  platform: Platform;
  messages: Tables<"messages">[];
  tasks: Tables<"tasks">[];
  notes: Tables<"notes">[];
  lead_files: Tables<"lead_files">[];
  linkedin_posts: Tables<"linkedin_posts">[];
  social_media_posts: any[];
  parent_id?: string | null;
  level?: number | null;
  avatar_url?: string | null;
};