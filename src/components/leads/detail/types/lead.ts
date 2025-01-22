import { Tables } from "@/integrations/supabase/types";

export type LeadWithRelations = Tables<"leads"> & {
  messages: Tables<"messages">[];
  tasks: Tables<"tasks">[];
  notes: Tables<"notes">[];
  lead_files: Tables<"lead_files">[];
  social_media_posts: Tables<"social_media_posts">[];
};