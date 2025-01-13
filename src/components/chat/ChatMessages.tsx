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

  // Filter out system messages and log the messages we're actually displaying
  const displayMessages = messages.filter((m) => m.role !== "system");
  console.log("Messages to display:", displayMessages);

  if (displayMessages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-muted-foreground">Keine Nachrichten vorhanden</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto pr-4" ref={scrollRef}>
      <div className="space-y-4 mb-4">
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