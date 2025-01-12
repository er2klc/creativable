import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Bot, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { Message } from "ai";

interface ChatMessagesProps {
  messages: Message[];
  scrollRef: React.RefObject<HTMLDivElement>;
}

export const ChatMessages = ({ messages, scrollRef }: ChatMessagesProps) => {
  // Only show the latest message for each role to create typing effect
  const displayMessages = messages.reduce((acc, current) => {
    if (!current.content.trim() || current.role === 'system') return acc;
    
    const existingIndex = acc.findIndex(msg => msg.role === current.role);
    
    if (existingIndex >= 0) {
      // Update existing message content
      if (current.role === 'assistant') {
        acc[existingIndex] = current;
      }
      return acc;
    }
    
    return [...acc, current];
  }, [] as Message[]);

  return (
    <ScrollArea className="flex-1 pr-4" ref={scrollRef}>
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
    </ScrollArea>
  );
};