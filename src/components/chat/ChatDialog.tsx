import { useEffect, useRef, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";
import { Bot, SendHorizontal, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatMessage {
  id: string;
  role: string;
  content: string;
}

interface ChatDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ChatDialog({ open, onOpenChange }: ChatDialogProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const newMessage = { id: Date.now().toString(), role: "user", content: input };
    setMessages((prev) => [...prev, newMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("sessionToken")}`,
          "X-OpenAI-Key": localStorage.getItem("openaiApiKey") || "",
        },
        body: JSON.stringify({ messages }),
      });

      if (!response.ok) throw new Error("Fehler beim Abrufen der Antwort");

      const reader = response.body?.getReader();
      const decoder = new TextDecoder("utf-8");

      let assistantMessage = { id: Date.now().toString(), role: "assistant", content: "" };
      setMessages((prev) => [...prev, assistantMessage]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const json = JSON.parse(line.slice(6));
              assistantMessage.content += json.content;
              setMessages((prev) =>
                prev.map((msg) => (msg.id === assistantMessage.id ? assistantMessage : msg))
              );
            } catch (error) {
              console.error("Fehler beim Verarbeiten des Streams:", error);
            }
          }
        }
      }
    } catch (error) {
      console.error("Chat error:", error);
      toast.error("Fehler beim Abrufen der Antwort.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogTitle>Chat mit KI-Assistent</DialogTitle>
        <DialogDescription>Stelle deine Fragen oder bitte um Hilfe.</DialogDescription>
        <div className="flex flex-col h-[600px]">
          <ScrollArea className="flex-1 pr-4" ref={scrollRef}>
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={cn(
                  "flex gap-3 text-sm mb-4",
                  msg.role === "user" ? "justify-end" : "justify-start"
                )}
              >
                {msg.role === "assistant" && <Avatar><AvatarFallback><Bot /></AvatarFallback></Avatar>}
                <div className={cn("px-3 py-2 rounded-lg", msg.role === "user" ? "bg-primary" : "bg-muted")}>
                  {msg.content}
                </div>
              </div>
            ))}
            {isLoading && <div>Antwort wird geladen...</div>}
          </ScrollArea>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage();
            }}
            className="flex items-center gap-2 mt-4"
          >
            <Input
              placeholder="Nachricht schreiben..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isLoading}
            />
            <Button type="submit" disabled={isLoading}>
              <SendHorizontal />
            </Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
