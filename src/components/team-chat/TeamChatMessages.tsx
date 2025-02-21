
import { useEffect, RefObject } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { TeamMessage } from "./types";
import { useUser } from "@supabase/auth-helpers-react";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface TeamChatMessagesProps {
  messages: TeamMessage[];
  scrollRef: RefObject<HTMLDivElement>;
  isLoading: boolean;
}

export const TeamChatMessages = ({ messages, scrollRef, isLoading }: TeamChatMessagesProps) => {
  const user = useUser();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, scrollRef]);

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-4 text-center">
        <p className="text-muted-foreground">
          Noch keine Nachrichten. Schreibe etwas um die Unterhaltung zu beginnen!
        </p>
      </div>
    );
  }

  return (
    <ScrollArea ref={scrollRef} className="flex-1 p-4">
      <div className="space-y-4">
        {messages.map((message) => {
          const isOwnMessage = message.sender_id === user?.id;
          
          return (
            <div
              key={message.id}
              className={cn(
                "flex items-start gap-2",
                isOwnMessage && "flex-row-reverse"
              )}
            >
              <Avatar className="h-8 w-8 mt-1">
                <AvatarImage src={message.sender?.avatar_url || ''} />
                <AvatarFallback>
                  {message.sender?.display_name?.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              
              <div className={cn(
                "flex flex-col",
                isOwnMessage && "items-end"
              )}>
                <div className={cn(
                  "px-3 py-2 rounded-lg",
                  isOwnMessage 
                    ? "bg-primary text-primary-foreground" 
                    : "bg-muted"
                )}>
                  <p className="text-sm whitespace-pre-wrap">
                    {message.content}
                  </p>
                </div>
                
                <span className="text-xs text-muted-foreground mt-1">
                  {format(new Date(message.created_at), "HH:mm", { locale: de })}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </ScrollArea>
  );
};
