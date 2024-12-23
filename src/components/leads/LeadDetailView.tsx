import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Send, Instagram, Linkedin, Facebook, Video } from "lucide-react";
import { Tables } from "@/integrations/supabase/types";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SendMessageDialog } from "@/components/messaging/SendMessageDialog";
import { useSettings } from "@/hooks/use-settings";

const getPlatformIcon = (platform: string) => {
  switch (platform?.toLowerCase()) {
    case "instagram":
      return <Instagram className="h-4 w-4 mr-2" />;
    case "linkedin":
      return <Linkedin className="h-4 w-4 mr-2" />;
    case "facebook":
      return <Facebook className="h-4 w-4 mr-2" />;
    case "tiktok":
      return <Video className="h-4 w-4 mr-2" />;
    default:
      return null;
  }
};

const getPhaseTranslation = (phase: string, language: string = "de") => {
  const translations: Record<string, Record<string, string>> = {
    de: {
      initial_contact: "Erstkontakt",
      follow_up: "Follow-up",
      closing: "Abschluss",
    },
    en: {
      initial_contact: "Initial Contact",
      follow_up: "Follow-up",
      closing: "Closing",
    },
  };
  return translations[language]?.[phase] || phase;
};

const formatAiSummary = (summary: string, language: string = "de") => {
  if (!summary) return language === "de" ? "Keine Zusammenfassung verfügbar" : "No summary available";
  
  // Replace markdown-style formatting with styled elements
  return summary.split('\n').map((line, index) => {
    if (line.includes('**')) {
      const [label, value] = line.split(':');
      return (
        <div key={index} className="mb-2">
          <span className="font-semibold text-primary">{label.replace(/\*\*/g, '')}: </span>
          <span>{value?.trim()}</span>
        </div>
      );
    }
    return <p key={index} className="mb-2">{line}</p>;
  });
};

interface LeadDetailViewProps {
  leadId: string | null;
  onClose: () => void;
}

export const LeadDetailView = ({ leadId, onClose }: LeadDetailViewProps) => {
  const { settings } = useSettings();
  const { data: lead, isLoading } = useQuery({
    queryKey: ["lead", leadId],
    queryFn: async () => {
      if (!leadId) return null;
      const { data, error } = await supabase
        .from("leads")
        .select("*, messages(*), tasks(*)")
        .eq("id", leadId)
        .single();

      if (error) throw error;
      return data as Tables<"leads"> & {
        messages: Tables<"messages">[];
        tasks: Tables<"tasks">[];
      };
    },
    enabled: !!leadId,
  });

  const { data: aiSummary, isLoading: isLoadingAiSummary } = useQuery({
    queryKey: ["lead-summary", leadId, settings?.language],
    queryFn: async () => {
      if (!leadId) return null;
      const { data, error } = await supabase.functions.invoke("generate-lead-summary", {
        body: { 
          leadId,
          language: settings?.language || "de"
        },
      });
      if (error) throw error;
      return data;
    },
    enabled: !!leadId,
  });

  return (
    <Dialog open={!!leadId} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle>{lead?.name}</DialogTitle>
          {lead && (
            <SendMessageDialog
              lead={lead}
              trigger={
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                  <Send className="h-4 w-4" />
                  {settings?.language === "en" ? "Send Message" : "Nachricht senden"}
                </Button>
              }
            />
          )}
        </DialogHeader>

        {isLoading ? (
          <div>{settings?.language === "en" ? "Loading..." : "Lädt..."}</div>
        ) : lead ? (
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>{settings?.language === "en" ? "Lead Information" : "Lead Informationen"}</CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="grid grid-cols-2 gap-4">
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">
                      {settings?.language === "en" ? "Platform" : "Plattform"}
                    </dt>
                    <dd className="flex items-center">
                      {getPlatformIcon(lead.platform)}
                      {lead.platform}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">
                      {settings?.language === "en" ? "Industry" : "Branche"}
                    </dt>
                    <dd>{lead.industry}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">
                      {settings?.language === "en" ? "Phase" : "Phase"}
                    </dt>
                    <dd>{getPhaseTranslation(lead.phase, settings?.language)}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">
                      {settings?.language === "en" ? "Last Action" : "Letzte Aktion"}
                    </dt>
                    <dd>{lead.last_action || (settings?.language === "en" ? "No action recorded" : "Keine Aktion aufgezeichnet")}</dd>
                  </div>
                </dl>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>
                  {settings?.language === "en" ? "AI Summary" : "KI-Zusammenfassung"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoadingAiSummary ? (
                  <div>{settings?.language === "en" ? "Generating summary..." : "Generiere Zusammenfassung..."}</div>
                ) : (
                  <div className="prose prose-sm max-w-none">
                    {formatAiSummary(aiSummary?.summary || "", settings?.language)}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>
                  {settings?.language === "en" ? "Messages" : "Nachrichten"} ({lead.messages.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {lead.messages.map((message) => (
                    <div key={message.id} className="border-b pb-4">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                        {getPlatformIcon(message.platform)}
                        <span>
                          {new Date(message.sent_at || "").toLocaleString(
                            settings?.language === "en" ? "en-US" : "de-DE",
                            {
                              dateStyle: "medium",
                              timeStyle: "short",
                            }
                          )}
                        </span>
                      </div>
                      <p>{message.content}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>
                  {settings?.language === "en" ? "Tasks" : "Aufgaben"} ({lead.tasks.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {lead.tasks.map((task) => (
                    <div key={task.id} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={task.completed || false}
                        readOnly
                        className="h-4 w-4"
                      />
                      <span>{task.title}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
};
