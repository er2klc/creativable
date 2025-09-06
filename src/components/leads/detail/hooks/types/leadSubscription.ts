import { Tables } from "@/integrations/supabase/types";
import { Platform } from "@/config/platforms";

export type LeadWithRelations = Tables<"leads"> & {
  platform: Platform;
  messages: Tables<"messages">[];
  tasks: Tables<"tasks">[];
  notes: Tables<"notes">[];
};

export type SubscriptionPayload = {
  new: Record<string, any>;
  old: Record<string, any>;
  errors: any[] | null;
};