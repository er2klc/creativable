
import { Tables } from "@/integrations/supabase/types";

export interface LeadSummaryProps {
  lead: Pick<Tables<"leads">, "id" | "phase_id">;
}

