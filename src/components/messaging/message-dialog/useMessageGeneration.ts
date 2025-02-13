
import { useState } from "react";
import { Tables } from "@/integrations/supabase/types";
import { supabase } from "@/integrations/supabase/client";

export function useMessageGeneration() {
  const [isGenerating, setIsGenerating] = useState(false);

  const generateMessage = async (lead: Tables<"leads">) => {
    setIsGenerating(true);
    try {
      // Hole zuerst die aktuelle Phase
      const { data: phase } = await supabase
        .from("pipeline_phases")
        .select("name")
        .eq("id", lead.phase_id)
        .single();

      // Hole die letzte Phasenanalyse
      const { data: latestAnalysis } = await supabase
        .from("phase_based_analyses")
        .select("*")
        .eq("lead_id", lead.id)
        .eq("phase_id", lead.phase_id)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      // Generate message with context from phase analysis
      const { data, error } = await supabase.functions.invoke("generate-message", {
        body: {
          leadName: lead.name,
          leadPlatform: lead.platform,
          leadIndustry: lead.industry,
          companyName: lead.company_name,
          usp: lead.usp,
          phaseName: phase?.name,
          phaseId: lead.phase_id,
          phaseAnalysis: latestAnalysis, // Include phase analysis in context
          socialMedia: {
            bio: lead.social_media_bio,
            followers: lead.social_media_followers,
            following: lead.social_media_following,
            engagementRate: lead.social_media_engagement_rate,
            interests: lead.social_media_interests
          }
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
