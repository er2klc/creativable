
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useLeadAnalysis(leadId: string, phaseId: string | null) {
  const [existingAnalysis, setExistingAnalysis] = useState("");

  useEffect(() => {
    async function fetchExistingAnalysis() {
      if (!leadId || !phaseId) return;
      
      try {
        const { data, error } = await supabase
          .from("phase_based_analyses")
          .select("content")
          .eq("lead_id", leadId)
          .eq("phase_id", phaseId)
          .maybeSingle();

        if (error) throw error;
        
        if (data?.content) {
          setExistingAnalysis(data.content);
        }
      } catch (error) {
        console.error("Error fetching analysis:", error);
      }
    }
    
    fetchExistingAnalysis();
  }, [leadId, phaseId]);

  return existingAnalysis;
}
