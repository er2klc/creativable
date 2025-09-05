import { Tables } from "@/integrations/supabase/types";
import { Platform } from "@/config/platforms";

export type LeadWithRelations = Tables<"leads"> & {
  platform?: Platform;
  pipeline?: Tables<"pipelines">;
  phase?: Tables<"pipeline_phases">;
  messages?: Tables<"messages">[];
  tasks?: Tables<"tasks">[];
  notes?: Tables<"notes">[];
};

export type SubscriptionPayload = {
  new: Record<string, any>;
  old: Record<string, any>;
  errors: any[] | null;
};