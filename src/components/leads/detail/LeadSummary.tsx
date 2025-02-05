
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useSettings } from "@/hooks/use-settings";
import { Bot, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible";
import { LeadSummaryProps } from "./types/summary";
import { SummarySection } from "./components/SummarySection";
import { SummaryControls } from "./components/SummaryControls";

export function LeadSummary({ lead }: LeadSummaryProps) {
  const { settings } = useSettings();
  const [summary, setSummary] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const loadExistingSummary = async () => {
      try {
        const { data, error } = await supabase
          .from("lead_summaries")
          .select("*")
          .eq("lead_id", lead.id)
          .maybeSingle();

        if (error) {
          console.error("Error loading summary:", error);
          return;
        }

        if (data) {
          setSummary(data.summary);
          setHasGenerated(true);
        }
      } catch (error) {
        console.error("Error in loadExistingSummary:", error);
      }
    };

    loadExistingSummary();
  }, [lead.id]);

  const generateSummary = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-lead-summary', {
        body: {
          leadId: lead.id,
          language: settings?.language || 'de'
        },
      });

      if (error) throw error;

      if (!data?.summary) {
        throw new Error("Keine Zusammenfassung generiert");
      }

      setSummary(data.summary);
      setHasGenerated(true);
      setIsOpen(true);
      toast.success(
        settings?.language === "en"
          ? "Summary generated successfully"
          : "Zusammenfassung erfolgreich generiert"
      );
    } catch (error) {
      console.error('Error generating summary:', error);
      toast.error(
        settings?.language === "en"
          ? "Error generating summary"
          : "Fehler beim Generieren der Zusammenfassung"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const getButtonText = () => {
    if (isLoading) {
      return settings?.language === "en" ? "Generating..." : "Generiere...";
    }
    if (!hasGenerated) {
      return settings?.language === "en" ? "Generate AI Summary" : "KI Zusammenfassung generieren";
    }
    if (!isOpen) {
      return settings?.language === "en" ? "View AI Summary" : "KI Zusammenfassung ansehen";
    }
    return settings?.language === "en" ? "Generate New Summary" : "KI Zusammenfassung neu generieren";
  };

  const formatSummary = (text: string) => {
    const sections = text.split(/\n\s*\n/).filter(Boolean);
    return sections.map((section, index) => (
      <SummarySection key={index} section={section} />
    ));
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <SummaryControls
            isLoading={isLoading}
            hasGenerated={hasGenerated}
            isOpen={isOpen}
            buttonText={getButtonText()}
            onCollapse={() => setIsOpen(false)}
            onGenerateClick={generateSummary}
          />

          <CollapsibleContent>
            {hasGenerated ? (
              <div className="space-y-4">
                {formatSummary(summary)}
              </div>
            ) : (
              <Button
                onClick={generateSummary}
                disabled={isLoading}
                className="w-full mb-4 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white"
              >
                {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Bot className="h-4 w-4 mr-2" />}
                {getButtonText()}
              </Button>
            )}
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
}

