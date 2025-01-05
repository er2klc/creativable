import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useChat } from "ai/react";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useChatContext } from "@/hooks/use-chat-context";
import { ChatHeader } from "./ChatHeader";
import { ChatMessages } from "./ChatMessages";
import { ChatInput } from "./ChatInput";

interface ChatDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ChatDialog({ open, onOpenChange }: ChatDialogProps) {
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { systemMessage } = useChatContext();

  const { messages, input, handleInputChange, handleSubmit, setMessages } = useChat({
    api: `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`,
    headers: {
      Authorization: `Bearer ${sessionToken}`,
      'X-OpenAI-Key': apiKey || '',
    },
    initialMessages: [
      {
        id: "system",
        role: "system",
        content: systemMessage,
      }
    ],
    streamProtocol: 'text',
    onResponse: () => {
      console.log("Chat response started");
    },
    onFinish: () => {
      console.log("Chat response finished");
      if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
    },
    onError: (error) => {
      console.error("Chat error:", error);
      toast.error("Fehler beim Senden der Nachricht. Bitte versuchen Sie es später erneut.");
    },
  });

  useEffect(() => {
    const setupChat = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          toast.error("Bitte melde dich an.");
          return;
        }
        setSessionToken(session.access_token);

        const { data: chatbotSettings, error } = await supabase
          .from("chatbot_settings")
          .select("openai_api_key")
          .eq("user_id", session.user.id)
          .maybeSingle();

        if (error) {
          console.error("Error fetching chatbot settings:", error);
          toast.error("Fehler beim Laden der Chat-Einstellungen.");
          return;
        }

        if (chatbotSettings?.openai_api_key) {
          setApiKey(chatbotSettings.openai_api_key);
          console.log("OpenAI API key loaded successfully");
        } else {
          toast.error("Kein OpenAI API-Key gefunden. Bitte hinterlege ihn in den Einstellungen.");
        }
      } catch (error) {
        console.error("Error in setupChat:", error);
        toast.error("Fehler beim Einrichten des Chats.");
      }
    };

    if (open) {
      setupChat();
      if (messages.length === 0) {
        setMessages([
          {
            id: "system",
            role: "system",
            content: systemMessage,
          },
          {
            id: "welcome",
            role: "assistant",
            content: "Hallo! Wie kann ich dir heute helfen?"
          }
        ]);
      }
    }
  }, [open, setMessages, systemMessage, messages.length]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <ChatHeader />
        <div className="flex flex-col h-[600px]">
          <ChatMessages messages={messages} scrollRef={scrollRef} />
          <ChatInput 
            input={input}
            handleInputChange={handleInputChange}
            handleSubmit={handleSubmit}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}