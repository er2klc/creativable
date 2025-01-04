import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useChat } from "ai/react";
import { Bot, SendHorizontal, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState, useRef } from "react";
import { toast } from "sonner";

export function ChatDialog({ open, onOpenChange }) {
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`,
    headers: {
      Authorization: `Bearer ${sessionToken}`,
      'X-OpenAI-Key': apiKey || '',
    },
    onResponse: (response) => {
      console.log("Chat response received");
    },
    onFinish: () => {
      if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
    },
    onError: (error) => {
      console.error("Chat error:", error);
      toast.error("Fehler beim Senden der Nachricht.");
    },
  });

  useEffect(() => {
    const setupChat = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          toast.error("Bitte melden Sie sich an.");
          return;
        }

        setSessionToken(session.access_token);

        const { data: chatbotSettings } = await supabase
          .from('chatbot_settings')
          .select('openai_api_key')
          .eq('user_id', session.user.id)
          .maybeSingle();

        if (chatbotSettings?.openai_api_key) {
          setApiKey(chatbotSettings.openai_api_key);
        } else {
          toast.error("Bitte fügen Sie einen OpenAI API Key hinzu.");
        }
      } catch (error) {
        console.error("Setup Chat Error:", error);
        toast.error("Fehler beim Einrichten des Chats.");
      }
    };

    if (open) {
      setupChat();
    }
  }, [open]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleClose = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogTitle>Chat mit KI-Assistent</DialogTitle>
        <DialogDescription>Ich helfe Ihnen gerne weiter.</DialogDescription>
        <ScrollArea ref={scrollRef}>
          {messages.map((message) => (
            <div key={message.id}>
              {message.role === "assistant" ? <Bot /> : <User />}
              <p>{message.content}</p>
            </div>
          ))}
        </ScrollArea>
        <form onSubmit={handleSubmit}>
          <Input value={input} onChange={handleInputChange} disabled={isLoading} />
          <Button type="submit">Senden</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
