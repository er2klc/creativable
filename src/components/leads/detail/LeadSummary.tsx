
import { useState, useEffect } from "react";
import { useSettings } from "@/hooks/use-settings";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { LeadSummaryProps } from "./types/summary";
import { NexusTimelineCard } from "./timeline/cards/NexusTimelineCard";
import { useAuth } from "@/hooks/use-auth";
import { PhaseAnalysisButton } from "./components/PhaseAnalysisButton";

export function LeadSummary({ lead }: LeadSummaryProps) {
  const { settings } = useSettings();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [latestAnalysis, setLatestAnalysis] = useState<any>(null);

  const generateAnalysis = async () => {
    if (!user) {
      toast.error(
        settings?.language === "en"
          ? "You must be logged in"
          : "Sie müssen angemeldet sein"
      );
      return;
    }

    if (isLoading) return;

    try {
      setIsLoading(true);
      console.log('Generating analysis for:', {
        leadId: lead.id,
        phaseId: lead.phase_id,
        userId: user.id,
        timestamp: new Date().toISOString()
      });

      const { data, error } = await supabase.functions.invoke('generate-phase-analysis', {
        body: {
          leadId: lead.id,
          phaseId: lead.phase_id,
          userId: user.id
        }
      });

      if (error) {
        console.error('Error from edge function:', error);
        throw error;
      }
      
      if (data.error) {
        console.error('Error from edge function:', data.error);
        toast.error(data.error);
        return;
      }

      console.log('Analysis generated successfully:', {
        analysisId: data.analysis?.id,
        timestamp: new Date().toISOString()
      });

      setLatestAnalysis(data.analysis);
      toast.success(
        settings?.language === "en"
          ? "Analysis generated successfully"
          : "Analyse erfolgreich generiert"
      );
    } catch (error: any) {
      console.error("Error generating analysis:", error);
      toast.error(
        settings?.language === "en"
          ? "Error generating analysis"
          : "Fehler beim Generieren der Analyse"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const loadLatestAnalysis = async () => {
    if (!lead?.id || !lead?.phase_id) {
      console.log('Missing required IDs for analysis:', { 
        leadId: lead?.id, 
        phaseId: lead?.phase_id 
      });
      return;
    }

    try {
      console.log('Loading latest analysis for:', {
        leadId: lead.id,
        phaseId: lead.phase_id,
        timestamp: new Date().toISOString()
      });

      const { data, error } = await supabase
        .from("phase_based_analyses")
        .select("*")
        .eq("lead_id", lead.id)
        .eq("phase_id", lead.phase_id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error('Error loading analysis:', error);
        throw error;
      }

      console.log('Latest analysis data:', {
        hasData: !!data,
        analysisId: data?.id,
        timestamp: new Date().toISOString()
      });
      
      setLatestAnalysis(data);
    } catch (error) {
      console.error("Error loading analysis:", error);
      setLatestAnalysis(null);
    }
  };

  useEffect(() => {
    loadLatestAnalysis();
  }, [lead.id, lead.phase_id]);

  if (!lead?.id || !lead?.phase_id) {
    console.log('Missing required lead data');
    return null;
  }

  // Wenn keine Analyse existiert, zeigen wir den Button an
  if (!latestAnalysis) {
    return (
      <div className="w-full bg-white">
        <PhaseAnalysisButton 
          isLoading={isLoading} 
          leadId={lead.id} 
          phaseId={lead.phase_id} 
          onGenerateAnalysis={generateAnalysis} 
        />
      </div>
    );
  }

  // Zeige existierende Analyse
  return (
    <NexusTimelineCard
      content={latestAnalysis.content}
      metadata={{
        type: 'phase_analysis',
        analysis_type: latestAnalysis.analysis_type,
        phase: latestAnalysis.metadata?.phase,
        timestamp: latestAnalysis.created_at,
        completed: latestAnalysis.completed,
        completed_at: latestAnalysis.completed_at,
        ...latestAnalysis.metadata
      }}
      onRegenerate={generateAnalysis}
      isRegenerating={isLoading}
    />
  );
}
