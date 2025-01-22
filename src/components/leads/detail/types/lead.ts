import { Tables } from "@/integrations/supabase/types";
import { Platform } from "@/config/platforms";

export type LeadWithRelations = Tables<"leads"> & {
  platform: Platform;
  messages: Tables<"messages">[];
  tasks: Tables<"tasks">[];
  notes: Tables<"notes">[];
  lead_files: Tables<"lead_files">[];
  parent_id?: string | null;
  level?: number | null;
  avatar_url?: string | null;
};