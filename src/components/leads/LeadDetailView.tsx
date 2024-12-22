import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";
import { Tables } from "@/integrations/supabase/types";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SendMessageDialog } from "@/components/messaging/SendMessageDialog";
import { useSettings } from "@/hooks/use-settings";

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
                  Nachricht senden
                </Button>
              }
            />
          )}
        </DialogHeader>

        {isLoading ? (
          <div>Loading...</div>
        ) : lead ? (
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Lead Information</CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="grid grid-cols-2 gap-4">
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">Platform</dt>
                    <dd>{lead.platform}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">Industry</dt>
                    <dd>{lead.industry}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">Phase</dt>
                    <dd>{lead.phase}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">Last Action</dt>
                    <dd>{lead.last_action || "No action recorded"}</dd>
                  </div>
                </dl>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>AI Summary</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoadingAiSummary ? (
                  <div>Generating summary...</div>
                ) : (
                  <p className="whitespace-pre-wrap">{aiSummary?.summary || "No summary available"}</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Messages ({lead.messages.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {lead.messages.map((message) => (
                    <div key={message.id} className="border-b pb-4">
                      <p className="text-sm text-muted-foreground">
                        {new Date(message.sent_at || "").toLocaleString()}
                      </p>
                      <p>{message.content}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tasks ({lead.tasks.length})</CardTitle>
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