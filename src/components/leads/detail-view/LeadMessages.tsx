import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tables } from "@/integrations/supabase/types";
import { Instagram, Linkedin, Facebook, Video } from "lucide-react";
import { useSettings } from "@/hooks/use-settings";

interface LeadMessagesProps {
  messages: Tables<"messages">[];
}

export function LeadMessages({ messages }: LeadMessagesProps) {
  const { settings } = useSettings();

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

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {settings?.language === "en" ? "Messages" : "Nachrichten"} ({messages.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {messages.map((message) => (
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
  );
}