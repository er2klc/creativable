import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSettings } from "@/hooks/use-settings";
import { Tables } from "@/integrations/supabase/types";
import { Bot } from "lucide-react";

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

  useEffect(() => {
    // Reset summary when lead changes
    setSummary("");
  }, [lead.id]);

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
        ) : summary ? (
          <div className="whitespace-pre-wrap">{summary}</div>
        ) : (
          <div className="text-muted-foreground">
            {settings?.language === "en" 
              ? "Click the button above to generate an AI summary" 
              : "Klicken Sie auf den Button oben, um eine KI-Zusammenfassung zu generieren"}
          </div>
        )}
      </CardContent>
    </Card>
  );
}