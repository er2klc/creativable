import { Tables } from "@/integrations/supabase/types";
import { useSettings } from "@/hooks/use-settings";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare } from "lucide-react";
import { useLeadSubscription } from "./hooks/useLeadSubscription";

interface LeadMessagesProps {
  messages: Tables<"messages">[];
  leadId: string;
}

export function LeadMessages({ messages, leadId }: LeadMessagesProps) {
  const { settings } = useSettings();
  
  // Set up real-time subscription for messages
  useLeadSubscription(leadId);

  const sentMessages = messages.filter(m => m.platform !== "received");
  const receivedMessages = messages.filter(m => m.platform === "received");

  return (
    <div className="grid grid-cols-2 gap-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            {settings?.language === "en" ? "Received Messages" : "Erhaltene Nachrichten"} ({receivedMessages.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {receivedMessages.map((message) => (
              <div key={message.id} className="border-b pb-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
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
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            {settings?.language === "en" ? "Sent Messages" : "Gesendete Nachrichten"} ({sentMessages.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {sentMessages.map((message) => (
              <div key={message.id} className="border-b pb-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
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
    </div>
  );
}