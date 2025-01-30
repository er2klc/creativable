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
  social_media_raw_data?: any[];
};