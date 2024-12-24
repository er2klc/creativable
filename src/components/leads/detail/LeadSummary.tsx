import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useSettings } from "@/hooks/use-settings";
import { Tables } from "@/integrations/supabase/types";
import { Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface LeadSummaryProps {
  lead: Tables<"leads"> & {
    messages: Tables<"messages">[];
    tasks: Tables<"tasks">[];
  };
}

export function LeadSummary({ lead }: LeadSummaryProps) {
  const { settings } = useSettings();
  const [summary, setSummary] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);

  const generateSummary = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/generate-lead-summary', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          leadId: lead.id,
          language: settings?.language || 'de'
        }),
      });

      if (!response.ok) {
        throw new Error(settings?.language === "en" 
          ? "Failed to generate summary" 
          : "Fehler beim Generieren der Zusammenfassung");
      }

      const data = await response.json();
      setSummary(data.summary);
      setHasGenerated(true);
      toast.success(settings?.language === "en" 
        ? "Summary generated successfully" 
        : "Zusammenfassung erfolgreich generiert");
    } catch (error) {
      console.error('Error generating summary:', error);
      toast.error(settings?.language === "en"
        ? "Error generating summary"
        : "Fehler beim Generieren der Zusammenfassung");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setSummary("");
    setHasGenerated(false);
  }, [lead.id]);

  return (
    <Card>
      <CardContent className="pt-6">
        {!hasGenerated && (
          <Button
            onClick={generateSummary}
            disabled={isLoading}
            className="w-full mb-4"
            variant="outline"
          >
            <Bot className="h-4 w-4 mr-2" />
            {isLoading
              ? settings?.language === "en"
                ? "Generating..."
                : "Generiere..."
              : settings?.language === "en"
              ? "Generate AI Summary"
              : "KI Zusammenfassung generieren"}
          </Button>
        )}
        {isLoading ? (
          <div className="animate-pulse text-center text-muted-foreground">
            {settings?.language === "en"
              ? "Generating summary..."
              : "Generiere Zusammenfassung..."}
          </div>
        ) : summary ? (
          <div className="whitespace-pre-wrap prose prose-sm max-w-none">
            {summary}
          </div>
        ) : !hasGenerated ? (
          <div className="text-center text-muted-foreground">
            {settings?.language === "en"
              ? "Click the button above to generate an AI summary"
              : "Klicken Sie auf den Button oben, um eine KI-Zusammenfassung zu generieren"}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}