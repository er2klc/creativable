
import { Tables } from "@/integrations/supabase/types";

export interface LeadSummaryProps {
  lead: {
    id: string;
    phase_id: string;
    pipeline_id?: string;
    status?: string;
    messages?: Tables<"messages">[];
    tasks?: Tables<"tasks">[];
    phase?: {
      id: string;
      name: string;
      order_index: number;
    } | null;
    pipeline?: {
      id: string;
      name: string;
    } | null;
  };
}
