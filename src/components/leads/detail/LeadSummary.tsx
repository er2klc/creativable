
import { useState, useEffect } from "react";
import { useSettings } from "@/hooks/use-settings";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { LeadSummaryProps } from "./types/summary";
import { NexusTimelineCard } from "./timeline/cards/NexusTimelineCard";
import { useAuth } from "@/hooks/use-auth";
import { PhaseAnalysisButton } from "./components/PhaseAnalysisButton";
import { useQueryClient } from "@tanstack/react-query";
import { BusinessMatchCard } from "./timeline/cards/BusinessMatchCard";
import { Gauge, Target } from "lucide-react";
import { Button } from "@/components/ui/button";

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

  // New state for business match
  const [businessMatch, setBusinessMatch] = useState<any>(null);
  const [isLoadingBusinessMatch, setIsLoadingBusinessMatch] = useState(false);

  // Load business match and/or existing phase analysis
  useEffect(() => {
    async function loadAnalysisData() {
      if (!lead.id || !user?.id) return;
      
      try {
        // 1. Check for existing business match
        const { data: existingMatch, error: matchError } = await supabase
          .from("lead_business_match")
          .select("*")
          .eq("lead_id", lead.id)
          .eq("user_id", user.id)
          .maybeSingle();

        if (matchError) throw matchError;
        
        if (existingMatch) {
          setBusinessMatch(existingMatch);
        }
        
        // 2. Check for existing phase analysis only if no business match
        if (!existingMatch && lead.phase_id) {
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
                name: "Current Phase"
              },
              timestamp: existingAnalysis.created_at,
              metadata: existingAnalysis.metadata
            });
          }

          // 3. Determine phase position in pipeline
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
        }
      } catch (error) {
        console.error("Error loading analysis data:", error);
      }
    }
    
    loadAnalysisData();
  }, [lead.id, lead.phase_id, settings?.language, user?.id]);

  const generateBusinessMatch = async () => {
    if (!user) {
      toast.error(
        settings?.language === "en"
          ? "You must be logged in"
          : "Sie müssen angemeldet sein"
      );
      return;
    }

    try {
      setIsLoadingBusinessMatch(true);
      
      const { data, error } = await supabase.functions.invoke('generate-lead-business-match', {
        body: {
          leadId: lead.id,
          userId: user.id
        }
      });

      if (error) {
        console.error("Edge function error:", error);
        throw error;
      }
      
      if (data.error) {
        console.error("Business match generation error:", data.error);
        toast.error(settings?.language === "en" 
          ? `Business match generation failed: ${data.error}` 
          : `Fehler bei der Business Match Generierung: ${data.error}`);
        return;
      }

      setBusinessMatch(data.analysis);
      
      queryClient.invalidateQueries({ queryKey: ["lead", lead.id] });
      queryClient.invalidateQueries({ queryKey: ["lead-with-relations", lead.id] });
      
      toast.success(
        settings?.language === "en"
          ? "Business match analysis created successfully"
          : "Business Match Analyse erfolgreich erstellt"
      );
    } catch (error: any) {
      console.error("Error generating business match:", error);
      toast.error(
        settings?.language === "en"
          ? `Error generating business match: ${error.message || "Please try again"}`
          : `Fehler bei der Business Match Generierung: ${error.message || "Bitte versuchen Sie es erneut"}`
      );
    } finally {
      setIsLoadingBusinessMatch(false);
    }
  };

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
      
      // Get user's display name to include in analysis
      const { data: profileData } = await supabase
        .from('profiles')
        .select('display_name')
        .eq('id', user.id)
        .single();
        
      const userName = profileData?.display_name || 'Sie';
      
      const { data, error } = await supabase.functions.invoke('generate-lead-phase-analysis', {
        body: {
          leadId: lead.id,
          phaseId: lead.phase_id,
          userId: user.id,
          userName: userName
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
          name: "Current Phase"
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

  // Render business match score if it exists
  if (businessMatch) {
    return (
      <BusinessMatchCard 
        matchScore={businessMatch.match_score}
        skills={businessMatch.skills || []}
        commonalities={businessMatch.commonalities || []}
        potentialNeeds={businessMatch.potential_needs || []}
        strengths={businessMatch.strengths || []}
        content={businessMatch.analysis_content}
        onRegenerate={generateBusinessMatch}
        isRegenerating={isLoadingBusinessMatch}
      />
    );
  }

  // Show business match analysis button if no analysis exists yet
  if (!businessMatch && !analysisContent) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Target className="w-5 h-5 mr-2 text-blue-600" />
            <h3 className="text-lg font-semibold">Business Match Analyse</h3>
          </div>
        </div>
        
        <p className="text-gray-600 mb-4">
          Analysieren Sie, wie gut dieser Kontakt zu Ihrem Geschäft passt. Die KI bewertet auf einer Skala von 0-100 die Übereinstimmung basierend auf dem Profil und identifiziert Gemeinsamkeiten, Stärken und Bedarfe.
        </p>
        
        <Button
          className="w-full"
          onClick={generateBusinessMatch}
          disabled={isLoadingBusinessMatch}
        >
          {isLoadingBusinessMatch ? "Analyse wird erstellt..." : "Business Match Analyse erstellen"}
        </Button>
      </div>
    );
  }

  // Use phase info from metadata if available, otherwise use our calculated info
  if (analysisContent) {
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

  // Show phase analysis button if no business match or phase analysis
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
