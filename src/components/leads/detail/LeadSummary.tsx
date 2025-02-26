
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

  console.log("LeadSummary initializing with props:", {
    leadId: lead?.id,
    phaseId: lead?.phase_id,
    hasUser: !!user,
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

    try {
      setIsLoading(true);
      console.log("Starting analysis generation for:", {
        leadId: lead.id,
        phaseId: lead.phase_id,
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
        // If analysis exists, hide button and show existing analysis
        setShowButton(false);
        return;
      }

      // If no analysis exists, generate a new one
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
        toast.error(data.error);
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

  // Check if analysis already exists for this phase
  const checkExistingAnalysis = async () => {
    try {
      console.log("Checking for existing analysis:", {
        leadId: lead.id,
        phaseId: lead.phase_id,
        timestamp: new Date().toISOString()
      });

      const { data: existingAnalysis, error } = await supabase
        .from("phase_based_analyses")
        .select("id")
        .eq("lead_id", lead.id)
        .eq("phase_id", lead.phase_id)
        .maybeSingle();

      console.log("Existing analysis query result:", {
        leadId: lead.id,
        phaseId: lead.phase_id,
        hasAnalysis: !!existingAnalysis,
        error: error
      });

      if (existingAnalysis) {
        setShowButton(false);
      } else {
        setShowButton(true);
      }
    } catch (error) {
      console.error("Error checking existing analysis:", error);
      // If there's an error checking, we'll show the button by default
      setShowButton(true);
    }
  };

  // Check for existing analysis on component mount and phase change
  useEffect(() => {
    console.log("LeadSummary useEffect triggered:", {
      leadId: lead.id,
      phaseId: lead.phase_id,
      timestamp: new Date().toISOString()
    });
    checkExistingAnalysis();
  }, [lead.id, lead.phase_id]);

  console.log("LeadSummary render state:", {
    showButton,
    isLoading,
    leadId: lead.id,
    phaseId: lead.phase_id,
    hasUser: !!user
  });

  if (!showButton) {
    return <NexusTimelineCard 
      content={settings?.language === "en" ? "Analysis already generated" : "Analyse bereits generiert"}
      metadata={{
        type: 'phase_analysis',
        timestamp: new Date().toISOString()
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
