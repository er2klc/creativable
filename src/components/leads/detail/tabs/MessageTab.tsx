import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useSettings } from "@/hooks/use-settings";
import { Platform } from "@/config/platforms";

interface MessageTabProps {
  leadId: string;
  platform: Platform;
}

export const MessageTab = ({ leadId, platform }: MessageTabProps) => {
  const { settings } = useSettings();
  const { user } = useAuth();
  const [newMessage, setNewMessage] = useState("");

  const handleAddMessage = async () => {
    const { error } = await supabase
      .from("messages")
      .insert({
        lead_id: leadId,
        content: newMessage,
        platform,
        user_id: user?.id,
      });

    if (error) {
      console.error("Error adding message:", error);
      return;
    }

    setNewMessage("");
    toast.success(settings?.language === "en" ? "Message added" : "Nachricht hinzugefügt");
  };

  return (
    <div className="space-y-4">
      <div>
        <Label>
          {settings?.language === "en" ? "Add Message" : "Nachricht hinzufügen"}
        </Label>
        <div className="flex gap-2 mt-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder={settings?.language === "en" ? "Enter message..." : "Nachricht eingeben..."}
          />
          <Button onClick={handleAddMessage}>
            {settings?.language === "en" ? "Add" : "Hinzufügen"}
          </Button>
        </div>
      </div>
    </div>
  );
};