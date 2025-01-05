import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Bot, SendHorizontal, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState, useRef } from "react";
import { toast } from "sonner";

interface ChatDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ChatDialog({ open, onOpenChange }: ChatDialogProps) {
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [isThinking, setIsThinking] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Array<{ id: string; role: string; content: string }>>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

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
      setMessages([
        {
          id: "welcome",
          role: "assistant",
          content: "Hallo! Ich bin dein MLM Assistant. Wie kann ich dir heute helfen?"
        }
      ]);
    }
  }, [open]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !sessionToken || !apiKey) return;

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const userMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: input
    };

    console.log('Sending message:', userMessage);
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsThinking(true);

    try {
      abortControllerRef.current = new AbortController();
      
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${sessionToken}`,
          'X-OpenAI-Key': apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: messages.concat(userMessage).map(({ role, content }) => ({ role, content })),
          language: 'de',
        }),
        signal: abortControllerRef.current.signal
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      console.log('Started receiving stream...');
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        console.log('Received chunk:', chunk);
        buffer += chunk;

        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              console.log('Received message:', data);
              
              setMessages(prev => {
                const lastMessage = prev[prev.length - 1];
                if (lastMessage?.role === 'assistant') {
                  return [
                    ...prev.slice(0, -1),
                    { ...lastMessage, content: lastMessage.content + data.content }
                  ];
                }
                return [...prev, { id: data.id, role: 'assistant', content: data.content }];
              });
            } catch (error) {
              console.warn('Error parsing chunk:', error);
            }
          }
        }
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        console.log('Request was cancelled');
      } else {
        console.error("Chat error:", error);
        toast.error("Fehler beim Senden der Nachricht. Bitte versuchen Sie es später erneut.");
      }
    } finally {
      setIsThinking(false);
      abortControllerRef.current = null;
    }
  };

  const handleClose = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogTitle>Chat mit KI-Assistent</DialogTitle>
        <DialogDescription>
          Ich helfe Ihnen gerne bei Ihren Fragen und Anliegen.
        </DialogDescription>
        <div className="flex flex-col h-[600px]">
          <ScrollArea className="flex-1 pr-4" ref={scrollRef}>
            <div className="space-y-4 mb-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "flex gap-3 text-slate-600 text-sm mb-4",
                    message.role === "user" && "justify-end"
                  )}
                >
                  {message.role === "assistant" && (
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>
                        <Bot className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div
                    className={cn(
                      "rounded-lg px-3 py-2 max-w-[85%] text-sm whitespace-pre-wrap",
                      message.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    )}
                  >
                    {message.content}
                  </div>
                  {message.role === "user" && (
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>
                        <User className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}
              {isThinking && (
                <div className="flex gap-3 text-slate-600 text-sm mb-4">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>
                      <Bot className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="bg-muted rounded-lg px-3 py-2">
                    Denke nach...
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
          <form onSubmit={handleSubmit} className="flex items-center gap-2 mt-4">
            <Input
              placeholder="Schreibe eine Nachricht..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <Button type="submit" size="icon" disabled={isThinking}>
              <SendHorizontal className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
