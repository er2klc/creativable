
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Bot, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { Message } from "ai";
import { useEffect } from "react";

interface ChatMessagesProps {
  messages: Message[];
  scrollRef: React.RefObject<HTMLDivElement>;
}

export const ChatMessages = ({ messages, scrollRef }: ChatMessagesProps) => {
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const displayMessages = messages.filter((m) => m.role !== "system");

  if (displayMessages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-4">
        <p className="text-muted-foreground">Keine Nachrichten vorhanden</p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto px-4 py-4" ref={scrollRef}>
      <div className="space-y-4">
        {displayMessages.map((message) => (
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
      </div>
    </div>
  );
};
