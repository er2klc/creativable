import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSettings } from "@/hooks/use-settings";
import { Tables } from "@/integrations/supabase/types";
import { Bot } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface LeadSummaryProps {
  lead: Tables<"leads"> & {
    messages: Tables<"messages">[];
    tasks: Tables<"tasks">[];
  };
}

export function LeadSummary({ lead }: LeadSummaryProps) {
  const { settings } = useSettings();
  const [summary, setSummary] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const generateSummary = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase.functions.invoke('generate-lead-summary', {
          body: JSON.stringify({
            leadId: lead.id,
            language: settings?.language || 'de'
          })
        });

        if (error) throw error;
        setSummary(data.summary);
      } catch (error) {
        console.error('Error generating summary:', error);
        setSummary(settings?.language === "en" 
          ? "Error generating summary"
          : "Fehler beim Generieren der Zusammenfassung");
      } finally {
        setIsLoading(false);
      }
    };

    generateSummary();
  }, [lead.id, settings?.language]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-2">
        <Bot className="h-5 w-5" />
        <CardTitle>
          {settings?.language === "en" ? "AI Summary" : "KI-Zusammenfassung"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="animate-pulse">
            {settings?.language === "en" ? "Generating summary..." : "Generiere Zusammenfassung..."}
          </div>
        ) : (
          <div className="whitespace-pre-wrap">{summary}</div>
        )}
      </CardContent>
    </Card>
  );
}