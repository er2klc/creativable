import { useState } from "react";
import { Tables } from "@/integrations/supabase/types";
import { supabase } from "@/integrations/supabase/client";

export function useMessageGeneration() {
  const [isGenerating, setIsGenerating] = useState(false);

  const generateMessage = async (lead: Tables<"leads">) => {
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-message", {
        body: {
          leadName: lead.name,
          leadPlatform: lead.platform,
          leadIndustry: lead.industry,
          companyName: lead.company_name,
          usp: lead.usp,
        },
      });

      if (error) throw error;
      return data.message;
    } finally {
      setIsGenerating(false);
    }
  };

  return { generateMessage, isGenerating };
}