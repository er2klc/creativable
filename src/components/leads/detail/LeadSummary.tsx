
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
  const [existingAnalysis, setExistingAnalysis] = useState<{
    id: string;
    content: string;
    metadata: any;
  } | null>(null);
  const queryClient = useQueryClient();

  console.log("LeadSummary mounting with props:", {
    leadId: lead?.id,
    phaseId: lead?.phase_id,
    phaseName: lead?.phase?.name,
    hasUser: !!user,
    route: window.location.pathname,
    timestamp: new Date().toISOString()
  });

  const checkExistingAnalysis = async () => {
    if (!lead?.id || !lead?.phase_id || !user) {
      console.log("Missing required data for analysis check:", { 
        leadId: lead?.id, 
        phaseId: lead?.phase_id,
        userId: user?.id
      });
      return;
    }

    try {
      const { data: analysis, error } = await supabase
        .from("phase_based_analyses")
        .select("id, content, metadata")
        .eq("lead_id", lead.id)
        .eq("phase_id", lead.phase_id)
        .eq("user_id", user.id)
        .maybeSingle();

      console.log("Existing analysis query result:", {
        leadId: lead.id,
        phaseId: lead.phase_id,
        phaseName: lead.phase?.name,
        hasAnalysis: !!analysis,
        error: error
      });

      if (error) throw error;
      setExistingAnalysis(analysis);
    } catch (error) {
      console.error("Error checking existing analysis:", error);
      setExistingAnalysis(null);
    }
  };

  const generateAnalysis = async () => {
    if (!user) {
      console.log("Generate analysis attempted without user");
      toast.error(
        settings?.language === "en"
          ? "You must be logged in"
          : "Sie müssen angemeldet sein"
      );
      return;
    }

    if (!lead.phase_id) {
      console.log("Generate analysis attempted without phase");
      toast.error(
        settings?.language === "en"
          ? "No phase selected"
          : "Keine Phase ausgewählt"
      );
      return;
    }

    try {
      setIsLoading(true);
      console.log("Starting analysis generation for:", {
        leadId: lead.id,
        phaseId: lead.phase_id,
        phaseName: lead.phase?.name,
        userId: user.id
      });

      const { data, error } = await supabase.functions.invoke('generate-phase-analysis', {
        body: {
          leadId: lead.id,
          phaseId: lead.phase_id,
          userId: user.id
        }
      });

      if (error) {
        console.error("Error in edge function call:", error);
        throw error;
      }
      
      if (data.error) {
        console.error("Error in analysis generation:", data.error);
        toast.error(
          settings?.language === "en"
            ? "Error generating analysis: " + data.error
            : "Fehler bei der Analyse-Generierung: " + data.error
        );
        return;
      }

      // Nach erfolgreicher Generierung alle relevanten Queries invalidieren
      queryClient.invalidateQueries({ queryKey: ["lead", lead.id] });
      queryClient.invalidateQueries({ queryKey: ["lead-timeline", lead.id] });
      
      // Analyse direkt neu laden
      await checkExistingAnalysis();
      
      toast.success(
        settings?.language === "en"
          ? "Analysis generated successfully"
          : "Analyse erfolgreich generiert"
      );
    } catch (error) {
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

  // Analyse bei Mount und wenn sich lead oder phase ändert prüfen
  useEffect(() => {
    checkExistingAnalysis();
  }, [lead?.id, lead?.phase_id, user?.id]);

  // Early return if missing required data
  if (!lead?.id) {
    console.log("LeadSummary: Missing lead ID");
    return null;
  }

  if (!lead?.phase_id) {
    console.log("LeadSummary: No phase selected");
    return (
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-yellow-800">
          {settings?.language === "en" 
            ? "Please select a phase to generate an analysis" 
            : "Bitte wählen Sie eine Phase aus, um eine Analyse zu generieren"}
        </p>
      </div>
    );
  }

  console.log("LeadSummary render state:", {
    hasExistingAnalysis: !!existingAnalysis,
    isLoading,
    leadId: lead.id,
    phaseId: lead.phase_id,
    phaseName: lead.phase?.name,
    hasUser: !!user
  });

  // Wenn eine Analyse existiert, zeige die NexusTimelineCard
  if (existingAnalysis) {
    return (
      <div className="space-y-4">
        <NexusTimelineCard 
          content={`${settings?.language === "en" ? "Analysis for phase" : "Analyse für Phase"} "${lead.phase?.name || 'Unknown'}"`}
          metadata={{
            type: 'phase_analysis',
            timestamp: new Date().toISOString(),
            phase_name: lead.phase?.name,
            analysis: existingAnalysis.metadata?.analysis || {}
          }}
          onRegenerate={generateAnalysis}
          isRegenerating={isLoading}
        />
      </div>
    );
  }

  // Wenn keine Analyse existiert, zeige den Generate-Button
  return (
    <PhaseAnalysisButton 
      isLoading={isLoading}
      leadId={lead.id}
      phaseId={lead.phase_id}
      onGenerateAnalysis={generateAnalysis}
    />
  );
}
