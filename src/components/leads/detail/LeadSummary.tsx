
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useSettings } from "@/hooks/use-settings";
import { Tables } from "@/integrations/supabase/types";
import { 
  Bot, 
  Calendar, 
  Building2, 
  MessageSquare, 
  ListTodo, 
  RefreshCw, 
  Loader2,
  Target,
  Lightbulb,
  MessageCircle,
  Users
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

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

  const getIconForSection = (title: string) => {
    switch (title) {
      case "KONTAKT-ANALYSE":
      case "CONTACT ANALYSIS":
        return <Target className="h-5 w-5 text-blue-500" />;
      case "STRATEGISCHE EMPFEHLUNG":
      case "STRATEGIC RECOMMENDATION":
        return <Lightbulb className="h-5 w-5 text-green-500" />;
      case "NACHRICHTENVORSCHLÄGE":
      case "MESSAGE SUGGESTIONS":
        return <MessageCircle className="h-5 w-5 text-purple-500" />;
      case "GEMEINSAMKEITEN & GESPRÄCHSAUFHÄNGER":
      case "COMMONALITIES & CONVERSATION STARTERS":
        return <Users className="h-5 w-5 text-orange-500" />;
      default:
        return <Bot className="h-5 w-5" />;
    }
  };

  const formatSummary = (text: string) => {
    // Split by numbered sections (1., 2., etc.)
    const sections = text.split(/\d+\.\s+/).filter(Boolean);
    
    return sections.map((section, index) => {
      // Get the section title (text before the first newline)
      const [title, ...contentLines] = section.split("\n").map(s => s.trim()).filter(Boolean);
      
      if (!contentLines.length) return null;

      const content = contentLines.join("\n");
      const icon = getIconForSection(title);

      return (
        <div key={index} className="p-4 bg-gradient-to-r from-white to-gray-50 rounded-lg shadow-sm mb-4 border border-gray-100">
          <div className="flex items-center gap-2 mb-2">
            {icon}
            <h3 className="font-semibold text-lg antialiased text-black">{title}</h3>
          </div>
          <div className="ml-7">
            {content.split("\n").map((line, i) => {
              // Handle different types of lines
              if (line.startsWith("A)") || line.startsWith("B)") || line.startsWith("C)")) {
                return (
                  <div key={i} className="mb-2 p-2 bg-white rounded border border-gray-100">
                    <p className="text-gray-700 leading-relaxed antialiased">{line}</p>
                  </div>
                );
              }
              if (line.startsWith("-")) {
                return (
                  <p key={i} className="text-gray-700 leading-relaxed antialiased ml-4">{line}</p>
                );
              }
              return (
                <p key={i} className="text-gray-700 leading-relaxed antialiased">{line}</p>
              );
            })}
          </div>
        </div>
      );
    });
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <div className="flex items-center justify-between mb-4">
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start text-left font-normal"
                onClick={() => {
                  if (hasGenerated && isOpen) {
                    generateSummary();
                  }
                }}
                disabled={isLoading}
              >
                {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Bot className="h-4 w-4 mr-2" />}
                {getButtonText()}
              </Button>
            </CollapsibleTrigger>
          </div>

          <CollapsibleContent>
            {hasGenerated ? (
              <div className="space-y-4">
                {formatSummary(summary)}
              </div>
            ) : (
              <Button
                onClick={generateSummary}
                disabled={isLoading}
                className="w-full mb-4 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white antialiased"
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
