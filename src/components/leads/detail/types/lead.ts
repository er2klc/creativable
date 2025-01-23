import { Tables } from "@/integrations/supabase/types";
import { Platform } from "@/config/platforms";

export interface LeadWithRelations extends Omit<Tables<"leads">, "notes"> {
  messages: Tables<"messages">[];
  tasks: Tables<"tasks">[];
  notes: Tables<"notes">[];
  lead_files: Tables<"lead_files">[];
  platform: Platform;
}