import { useState, useEffect } from "react";
import { useSettings } from "@/hooks/use-settings";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { LeadSummaryProps } from "./types/summary";
import { NexusTimelineCard } from "./timeline/cards/NexusTimelineCard";
import { useAuth } from "@/hooks/use-auth";
import { PhaseAnalysisButton } from "./components/PhaseAnalysisButton";
import { useQueryClient } from "@tanstack/react-query";

export function LeadSummary({ lead }: LeadSummaryProps) {
  const { settings } = useSettings();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showButton, setShowButton] = useState(true);
  const [analysisContent, setAnalysisContent] = useState<string | null>(null);
  const [analysisMetadata, setAnalysisMetadata] = useState<any>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    async function checkExistingAnalysis() {
      if (!lead.id || !lead.phase_id) return;
      
      try {
        const { data: existingAnalysis, error } = await supabase
          .from("phase_based_analyses")
          .select("*")
          .eq("lead_id", lead.id)
          .eq("phase_id", lead.phase_id)
          .maybeSingle();

        if (error) throw error;
        
        if (existingAnalysis) {
          setShowButton(false);
          setAnalysisContent(existingAnalysis.content);
          setAnalysisMetadata({
            type: 'phase_analysis',
            phase: {
              id: lead.phase_id,
              name: lead.phase_name || "Current Phase"
            },
            timestamp: existingAnalysis.created_at
          });
        } else {
          setShowButton(true);
          setAnalysisContent(null);
          setAnalysisMetadata(null);
        }
      } catch (error) {
        console.error("Error checking existing analysis:", error);
      }
    }
    
    checkExistingAnalysis();
  }, [lead.id, lead.phase_id, lead.phase_name]);

  const generateAnalysis = async () => {
    if (!user) {
      toast.error(
        settings?.language === "en"
          ? "You must be logged in"
          : "Sie müssen angemeldet sein"
      );
      return;
    }

    if (!lead.phase_id) {
      toast.error(
        settings?.language === "en"
          ? "Lead must be assigned to a phase"
          : "Kontakt muss einer Phase zugeordnet sein"
      );
      return;
    }

    try {
      setIsLoading(true);
      
      const { data, error } = await supabase.functions.invoke('generate-phase-analysis', {
        body: {
          leadId: lead.id,
          phaseId: lead.phase_id,
          userId: user.id
        }
      });

      if (error) {
        console.error("Edge function error:", error);
        throw error;
      }
      
      if (data.error) {
        console.error("Analysis generation error:", data.error);
        toast.error(data.error);
        return;
      }

      setShowButton(false);
      setAnalysisContent(data.analysis?.content || "Analysis generated");
      setAnalysisMetadata({
        type: 'phase_analysis',
        phase: {
          id: lead.phase_id,
          name: lead.phase_name || "Current Phase"
        },
        timestamp: new Date().toISOString()
      });
      
      queryClient.invalidateQueries({ queryKey: ["lead", lead.id] });
      queryClient.invalidateQueries({ queryKey: ["lead-with-relations", lead.id] });
      
      toast.success(
        settings?.language === "en"
          ? "Analysis generated successfully"
          : "Analyse erfolgreich generiert"
      );
    } catch (error: any) {
      console.error("Error generating analysis:", error);
      toast.error(
        settings?.language === "en"
          ? `Error generating analysis: ${error.message || "Please try again"}`
          : `Fehler beim Generieren der Analyse: ${error.message || "Bitte versuchen Sie es erneut"}`
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (analysisContent && !showButton) {
    return (
      <NexusTimelineCard 
        content={analysisContent}
        metadata={analysisMetadata}
        onRegenerate={generateAnalysis}
        isRegenerating={isLoading}
      />
    );
  }

  return (
    <PhaseAnalysisButton 
      isLoading={isLoading}
      leadId={lead.id}
      phaseId={lead.phase_id}
      onGenerateAnalysis={generateAnalysis}
    />
  );
}
