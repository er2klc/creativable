
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useSettings } from "@/hooks/use-settings";
import { Bot, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible";
import { LeadSummaryProps } from "./types/summary";
import { NexusTimelineCard } from "./timeline/cards/NexusTimelineCard";

export function LeadSummary({ lead }: LeadSummaryProps) {
  const { settings } = useSettings();
  const [isLoading, setIsLoading] = useState(false);
  const [latestAnalysis, setLatestAnalysis] = useState<any>(null);
  const [isOpen, setIsOpen] = useState(false);

  const generateAnalysis = async () => {
    setIsLoading(true);
    try {
      // Generiere die Analyse mit der neuen Edge Function
      const { data, error } = await supabase.functions.invoke('generate-phase-analysis', {
        body: {
          leadId: lead.id,
          phaseId: lead.phase_id
        }
      });

      if (error) throw error;

      setLatestAnalysis(data.analysis);
      setIsOpen(true);
      
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

  // Lade die letzte Analyse beim ersten Rendern
  useEffect(() => {
    const loadLatestAnalysis = async () => {
      const { data } = await supabase
        .from("phase_based_analyses")
        .select("*")
        .eq("lead_id", lead.id)
        .eq("phase_id", lead.phase_id)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (data) {
        setLatestAnalysis(data);
        setIsOpen(true);
      }
    };

    loadLatestAnalysis();
  }, [lead.id, lead.phase_id]);

  return (
    <Card>
      <CardContent className="pt-6">
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Bot className="h-5 w-5" />
              <span className="text-lg font-semibold">
                {settings?.language === "en" ? "AI Analysis" : "KI Analyse"}
              </span>
            </div>
            <Button
              onClick={isOpen ? generateAnalysis : () => setIsOpen(true)}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Bot className="h-4 w-4 mr-2" />
              )}
              {getButtonText()}
            </Button>
          </div>

          <CollapsibleContent>
            {latestAnalysis ? (
              <NexusTimelineCard
                content={latestAnalysis.content}
                metadata={{
                  type: 'phase_analysis',
                  analysis_type: latestAnalysis.analysis_type,
                  phase: latestAnalysis.metadata?.phase,
                  timestamp: latestAnalysis.created_at,
                  ...latestAnalysis.metadata
                }}
              />
            ) : (
              <Button
                onClick={generateAnalysis}
                disabled={isLoading}
                className="w-full mb-4 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Bot className="h-4 w-4 mr-2" />
                )}
                {settings?.language === "en"
                  ? "Generate AI Analysis"
                  : "KI Analyse generieren"}
              </Button>
            )}
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );

  function getButtonText() {
    if (isLoading) {
      return settings?.language === "en" ? "Generating..." : "Generiere...";
    }
    if (!latestAnalysis) {
      return settings?.language === "en"
        ? "Generate AI Analysis"
        : "KI Analyse generieren";
    }
    if (!isOpen) {
      return settings?.language === "en" ? "View AI Analysis" : "KI Analyse ansehen";
    }
    return settings?.language === "en"
      ? "Generate New Analysis"
      : "Neue Analyse generieren";
  }
}
