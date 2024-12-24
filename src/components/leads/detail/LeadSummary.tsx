import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useSettings } from "@/hooks/use-settings";
import { Tables } from "@/integrations/supabase/types";
import { Bot, Calendar, Building2, MessageSquare, ListTodo, User, Users, Image, Link } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
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
  const [isLoading, setIsLoading] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);

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

      setSummary(data.summary);
      setHasGenerated(true);
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

  useEffect(() => {
    setSummary("");
    setHasGenerated(false);
  }, [lead.id]);

  const renderSocialMediaStats = () => {
    if (!lead.social_media_posts) return null;

    const stats = lead.social_media_posts as any;
    return (
      <div className="space-y-4 mb-6">
        <div className="p-4 bg-gradient-to-r from-white to-gray-50 rounded-lg shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-2">
            <Users className="h-5 w-5 text-blue-500" />
            <h3 className="font-semibold text-lg">
              {settings?.language === "en" ? "Social Media Stats" : "Social Media Statistiken"}
            </h3>
          </div>
          <div className="grid grid-cols-2 gap-4 ml-7">
            {stats.followers !== undefined && (
              <div>
                <span className="text-sm text-gray-500">
                  {settings?.language === "en" ? "Followers" : "Follower"}
                </span>
                <p className="font-medium">{stats.followers}</p>
              </div>
            )}
            {stats.following !== undefined && (
              <div>
                <span className="text-sm text-gray-500">
                  {settings?.language === "en" ? "Following" : "Folgt"}
                </span>
                <p className="font-medium">{stats.following}</p>
              </div>
            )}
            {stats.posts !== undefined && (
              <div>
                <span className="text-sm text-gray-500">
                  {settings?.language === "en" ? "Posts" : "Beiträge"}
                </span>
                <p className="font-medium">{stats.posts}</p>
              </div>
            )}
            {stats.connections !== undefined && (
              <div>
                <span className="text-sm text-gray-500">
                  {settings?.language === "en" ? "Connections" : "Verbindungen"}
                </span>
                <p className="font-medium">{stats.connections}</p>
              </div>
            )}
            {stats.headline && (
              <div className="col-span-2">
                <span className="text-sm text-gray-500">
                  {settings?.language === "en" ? "Headline" : "Headline"}
                </span>
                <p className="font-medium">{stats.headline}</p>
              </div>
            )}
            {stats.isPrivate !== undefined && (
              <div className="col-span-2">
                <span className="text-sm text-gray-500">
                  {settings?.language === "en" ? "Account Type" : "Konto-Typ"}
                </span>
                <p className="font-medium">
                  {stats.isPrivate ? 
                    (settings?.language === "en" ? "Private Account" : "Privates Konto") : 
                    (settings?.language === "en" ? "Public Account" : "Öffentliches Konto")}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const formatSummary = (text: string) => {
    const sections = text.split('**').filter(Boolean);
    return sections.map((section, index) => {
      const [title, content] = section.split(':').map(s => s.trim());
      if (!content) return null;

      let icon;
      switch (title) {
        case 'Kontaktstatus':
        case 'Contact Status':
          icon = <Calendar className="h-5 w-5 text-blue-500" />;
          break;
        case 'Geschäftsprofil':
        case 'Business Profile':
          icon = <Building2 className="h-5 w-5 text-green-500" />;
          break;
        case 'Kommunikationsverlauf':
        case 'Communication History':
          icon = <MessageSquare className="h-5 w-5 text-purple-500" />;
          break;
        case 'Nächste Schritte':
        case 'Next Steps':
          icon = <ListTodo className="h-5 w-5 text-orange-500" />;
          break;
        default:
          icon = <Bot className="h-5 w-5" />;
      }

      return (
        <div key={index} className="p-4 bg-gradient-to-r from-white to-gray-50 rounded-lg shadow-sm mb-4 border border-gray-100">
          <div className="flex items-center gap-2 mb-2">
            {icon}
            <h3 className="font-semibold text-lg">{title}</h3>
          </div>
          <p className="text-gray-700 ml-7 leading-relaxed">{content}</p>
        </div>
      );
    });
  };

  return (
    <Card className="overflow-hidden bg-gradient-to-b from-white to-gray-50">
      <CardContent className="pt-6">
        {renderSocialMediaStats()}
        
        {!hasGenerated && (
          <Button
            onClick={generateSummary}
            disabled={isLoading}
            className="w-full mb-4 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white"
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
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-6 bg-gray-200 rounded-full w-1/4 mb-2"></div>
                <div className="h-20 bg-gray-200 rounded-lg"></div>
              </div>
            ))}
          </div>
        ) : summary ? (
          <div className="space-y-4">
            {formatSummary(summary)}
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
