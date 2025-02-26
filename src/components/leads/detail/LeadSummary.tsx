
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
  const [showButton, setShowButton] = useState(true);

  console.log("LeadSummary mounting with props:", {
    leadId: lead?.id,
    phaseId: lead?.phase_id,
    phaseName: lead?.phase?.name,
    hasUser: !!user,
    route: window.location.pathname,
    timestamp: new Date().toISOString()
  });

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
      
      // Check if analysis exists for this phase
      const { data: existingAnalysis, error: queryError } = await supabase
        .from("phase_based_analyses")
        .select("id, content")
        .eq("lead_id", lead.id)
        .eq("phase_id", lead.phase_id)
        .maybeSingle();

      console.log("Existing analysis check:", {
        leadId: lead.id,
        phaseId: lead.phase_id,
        exists: !!existingAnalysis,
        error: queryError
      });

      if (existingAnalysis) {
        setShowButton(false);
        return;
      }

      // Generate new analysis
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

      setShowButton(false);
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

  const checkExistingAnalysis = async () => {
    if (!lead?.id || !lead?.phase_id) {
      console.log("Missing required lead data for analysis check:", { 
        leadId: lead?.id, 
        phaseId: lead?.phase_id 
      });
      return;
    }

    try {
      const { data: existingAnalysis, error } = await supabase
        .from("phase_based_analyses")
        .select("id")
        .eq("lead_id", lead.id)
        .eq("phase_id", lead.phase_id)
        .maybeSingle();

      console.log("Existing analysis query result:", {
        leadId: lead.id,
        phaseId: lead.phase_id,
        phaseName: lead.phase?.name,
        hasAnalysis: !!existingAnalysis,
        error: error
      });

      setShowButton(!existingAnalysis);
    } catch (error) {
      console.error("Error checking existing analysis:", error);
      setShowButton(true);
    }
  };

  useEffect(() => {
    if (lead?.id && lead?.phase_id) {
      checkExistingAnalysis();
    }
  }, [lead?.id, lead?.phase_id]);

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
    showButton,
    isLoading,
    leadId: lead.id,
    phaseId: lead.phase_id,
    phaseName: lead.phase?.name,
    hasUser: !!user
  });

  if (!showButton) {
    return <NexusTimelineCard 
      content={settings?.language === "en" 
        ? `Analysis for phase "${lead.phase?.name || 'Unknown'}" already generated` 
        : `Analyse für Phase "${lead.phase?.name || 'Unbekannt'}" bereits generiert`}
      metadata={{
        type: 'phase_analysis',
        timestamp: new Date().toISOString(),
        phase_name: lead.phase?.name
      }}
      onRegenerate={generateAnalysis}
      isRegenerating={isLoading}
    />;
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
