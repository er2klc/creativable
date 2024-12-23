import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface SendMessageParams {
  platform: string;
  message: string;
  leadId: string;
  socialMediaUsername?: string | null;
}

export function useMessageSending() {
  const [isSending, setIsSending] = useState(false);

  const sendMessage = async ({ platform, message, leadId, socialMediaUsername }: SendMessageParams) => {
    if (!socialMediaUsername) {
      throw new Error("No social media username provided");
    }

    setIsSending(true);
    try {
      const { error } = await supabase.functions.invoke("send-message", {
        body: {
          platform,
          message,
          leadId,
          socialMediaUsername,
        },
      });

      if (error) throw error;
    } finally {
      setIsSending(false);
    }
  };

  return { sendMessage, isSending };
}