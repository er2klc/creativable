
import { useEffect, RefObject } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { TeamMessage } from "./types";
import { useUser } from "@supabase/auth-helpers-react";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

const MessageStatus = ({ message }: { message: TeamMessage }) => {
  if (!message.delivered_at) return null;
  
  return (
    <div className="flex items-center justify-end mt-1">
      <div className="flex gap-0">
        <Check className={cn(
          "h-3 w-3",
          message.read_at ? "text-blue-500" : "text-muted-foreground"
        )} />
        <Check className={cn(
          "h-3 w-3 -ml-1",
          message.read_at ? "text-blue-500" : "text-muted-foreground/0"
        )} />
      </div>
    </div>
  );
};

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
                  "px-3 py-2 rounded-lg max-w-[85%]",
                  isOwnMessage 
                    ? "bg-primary text-primary-foreground" 
                    : "bg-muted"
                )}>
                  <p className="text-sm whitespace-pre-wrap">
                    {message.content}
                  </p>
                </div>
                
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-muted-foreground">
                    {format(new Date(message.created_at), "HH:mm", { locale: de })}
                  </span>
                  {isOwnMessage && <MessageStatus message={message} />}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </ScrollArea>
  );
};
