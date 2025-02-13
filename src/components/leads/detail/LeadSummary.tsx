
import { useState } from "react";
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

  const generateAnalysis = async () => {
    if (!user) {
      toast.error(
        settings?.language === "en"
          ? "You must be logged in"
          : "Sie müssen angemeldet sein"
      );
      return;
    }

    try {
      setIsLoading(true);
      
      // Erst prüfen ob eine Analyse existiert
      const { data: existingAnalysis } = await supabase
        .from("phase_based_analyses")
        .select("id")
        .eq("lead_id", lead.id)
        .eq("phase_id", lead.phase_id)
        .maybeSingle();

      if (existingAnalysis) {
        setShowButton(false);
        return;
      }

      // Wenn keine Analyse existiert, generiere eine neue
      const { data, error } = await supabase.functions.invoke('generate-phase-analysis', {
        body: {
          leadId: lead.id,
          phaseId: lead.phase_id,
          userId: user.id
        }
      });

      if (error) throw error;
      
      if (data.error) {
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

  if (!showButton) {
    return <NexusTimelineCard 
      content="Analyse bereits generiert"
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
