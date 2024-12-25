import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageSquare, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useSettings } from "@/hooks/use-settings";

const Messages = () => {
  const { settings } = useSettings();
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);

  const { data: messages = [], isLoading } = useQuery({
    queryKey: ['messages'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          leads (
            id,
            name,
            platform
          )
        `)
        .eq('user_id', user.id)
        .order('sent_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  // Mark messages as read when viewed
  useEffect(() => {
    const markMessagesAsRead = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase
        .from('messages')
        .update({ read: true })
        .eq('user_id', user.id)
        .eq('read', false);
    };

    markMessagesAsRead();
  }, []);

  const handleCopyMessage = async (content: string) => {
    await navigator.clipboard.writeText(content);
    toast.success(
      settings?.language === "en" 
        ? "Message copied to clipboard" 
        : "Nachricht in die Zwischenablage kopiert"
    );
  };

  const groupedMessages = messages.reduce((acc, message) => {
    const leadId = message.lead_id;
    if (!acc[leadId]) {
      acc[leadId] = [];
    }
    acc[leadId].push(message);
    return acc;
  }, {} as Record<string, typeof messages>);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">
        {settings?.language === "en" ? "Messages" : "Nachrichten"}
      </h1>

      <Tabs defaultValue={Object.keys(groupedMessages)[0] || "no-messages"}>
        <TabsList className="w-full border-b">
          {Object.entries(groupedMessages).map(([leadId, messages]) => (
            <TabsTrigger 
              key={leadId} 
              value={leadId}
              className="flex items-center gap-2"
            >
              <MessageSquare className="h-4 w-4" />
              {messages[0]?.leads?.name || "Unknown"}
              <span className="text-xs text-muted-foreground">
                ({messages[0]?.leads?.platform})
              </span>
            </TabsTrigger>
          ))}
        </TabsList>

        {Object.entries(groupedMessages).map(([leadId, messages]) => (
          <TabsContent key={leadId} value={leadId} className="space-y-4">
            {messages.map((message) => (
              <Card key={message.id}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {message.platform === "received" ? "Empfangen" : "Gesendet"}
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleCopyMessage(message.content)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">{message.content}</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    {new Date(message.sent_at || "").toLocaleString(
                      settings?.language === "en" ? "en-US" : "de-DE",
                      {
                        dateStyle: "medium",
                        timeStyle: "short",
                      }
                    )}
                  </p>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default Messages;