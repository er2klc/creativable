
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
  const [analysisContent, setAnalysisContent] = useState<string | null>(null);
  const [analysisMetadata, setAnalysisMetadata] = useState<any>(null);
  const [phaseInfo, setPhaseInfo] = useState<{
    position: string;
    index: number;
    total: number;
    positionLabel: string;
  } | null>(null);
  const queryClient = useQueryClient();

  // Load existing analysis and determine phase position
  useEffect(() => {
    async function loadAnalysisAndPhaseInfo() {
      if (!lead.id || !lead.phase_id) return;
      
      try {
        // 1. Check for existing analysis
        const { data: existingAnalysis, error } = await supabase
          .from("phase_based_analyses")
          .select("*")
          .eq("lead_id", lead.id)
          .eq("phase_id", lead.phase_id)
          .maybeSingle();

        if (error) throw error;
        
        if (existingAnalysis) {
          setAnalysisContent(existingAnalysis.content);
          setAnalysisMetadata({
            type: 'phase_analysis',
            phase: {
              id: lead.phase_id,
              name: lead.phase_name || "Current Phase"
            },
            timestamp: existingAnalysis.created_at,
            metadata: existingAnalysis.metadata
          });
        } else {
          setAnalysisContent(null);
          setAnalysisMetadata(null);
        }

        // 2. Determine phase position in pipeline
        const { data: pipelinePhases, error: phasesError } = await supabase
          .from("pipeline_phases")
          .select("id, name, order_index, pipeline_id")
          .eq("id", lead.phase_id)
          .single();

        if (phasesError) throw phasesError;

        const { data: allPhases, error: allPhasesError } = await supabase
          .from("pipeline_phases")
          .select("id, name, order_index")
          .eq("pipeline_id", pipelinePhases.pipeline_id)
          .order("order_index", { ascending: true });

        if (allPhasesError) throw allPhasesError;

        const totalPhases = allPhases.length;
        const currentPhaseIndex = allPhases.findIndex(phase => phase.id === lead.phase_id);
        
        let phasePosition = "middle";
        if (currentPhaseIndex === 0) {
          phasePosition = "first";
        } else if (currentPhaseIndex === totalPhases - 1) {
          phasePosition = "last";
        }

        setPhaseInfo({
          position: phasePosition,
          index: currentPhaseIndex,
          total: totalPhases,
          positionLabel: settings?.language === "en" 
            ? capitalizeFirstLetter(phasePosition) + " Phase" 
            : phasePosition === "first" 
              ? "Erste Phase" 
              : phasePosition === "last" 
                ? "Letzte Phase" 
                : "Mittlere Phase"
        });
      } catch (error) {
        console.error("Error loading analysis and phase info:", error);
      }
    }
    
    loadAnalysisAndPhaseInfo();
  }, [lead.id, lead.phase_id, lead.phase_name, settings?.language]);

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
      
      const { data, error } = await supabase.functions.invoke('generate-lead-phase-analysis', {
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
        toast.error(settings?.language === "en" 
          ? `Analysis generation failed: ${data.error}` 
          : `Fehler bei der Analyse-Generierung: ${data.error}`);
        return;
      }

      // Update state with new analysis
      setAnalysisContent(data.analysis?.content || "Analysis generated");
      setAnalysisMetadata({
        type: 'phase_analysis',
        phase: {
          id: lead.phase_id,
          name: lead.phase_name || "Current Phase"
        },
        timestamp: new Date().toISOString(),
        metadata: data.analysis?.metadata || {}
      });
      
      queryClient.invalidateQueries({ queryKey: ["lead", lead.id] });
      queryClient.invalidateQueries({ queryKey: ["lead-with-relations", lead.id] });
      
      toast.success(
        settings?.language === "en"
          ? "Phase analysis created successfully"
          : "Phasenanalyse erfolgreich erstellt"
      );
    } catch (error: any) {
      console.error("Error generating analysis:", error);
      toast.error(
        settings?.language === "en"
          ? `Error generating analysis: ${error.message || "Please try again"}`
          : `Fehler bei der Analyse-Generierung: ${error.message || "Bitte versuchen Sie es erneut"}`
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (analysisContent) {
    // Use phase info from metadata if available, otherwise use our calculated info
    const analysisPhaseInfo = analysisMetadata?.metadata?.phase_position 
      ? {
          position: analysisMetadata.metadata.phase_position,
          index: analysisMetadata.metadata.phase_index,
          total: analysisMetadata.metadata.total_phases,
          positionLabel: settings?.language === "en" 
            ? capitalizeFirstLetter(analysisMetadata.metadata.phase_position) + " Phase" 
            : analysisMetadata.metadata.phase_position === "first" 
              ? "Erste Phase" 
              : analysisMetadata.metadata.phase_position === "last" 
                ? "Letzte Phase" 
                : "Mittlere Phase"
        }
      : phaseInfo;
    
    return (
      <NexusTimelineCard 
        content={analysisContent}
        metadata={{
          ...analysisMetadata,
          phaseInfo: analysisPhaseInfo
        }}
        onRegenerate={generateAnalysis}
        isRegenerating={isLoading}
      />
    );
  }

  // Show analysis button if no analysis exists yet
  return (
    <PhaseAnalysisButton 
      isLoading={isLoading}
      leadId={lead.id}
      phaseId={lead.phase_id!}
      onGenerateAnalysis={generateAnalysis}
    />
  );
}

function capitalizeFirstLetter(string: string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}
