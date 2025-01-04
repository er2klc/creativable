import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useSettings } from "@/hooks/use-settings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useChat } from "ai/react";
import { Bot, SendHorizontal, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

interface ChatDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ChatDialog({ open, onOpenChange }: ChatDialogProps) {
  const { settings } = useSettings();
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: `${process.env.SUPABASE_URL || 'https://agqaitxlmxztqyhpcjau.supabase.co'}/functions/v1/ai-chat`,
    headers: {
      'Authorization': `Bearer ${settings?.openai_api_key || ''}`,
      'apikey': process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFncWFpdHhsbXh6dHF5aHBjamF1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ4NjgxMjEsImV4cCI6MjA1MDQ0NDEyMX0.rhw4HkZkSMWYOiNRHhQJwNYEk86ZsMEkORRel1aQJY4',
    }
  });

  // Only render the dialog content if we have an API key
  if (!settings || settings.openai_api_key === null || settings.openai_api_key === '') {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <div className="flex flex-col h-[600px]">
          <ScrollArea className="flex-1 pr-4">
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
                      "rounded-lg px-3 py-2 max-w-[85%] text-sm",
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
          <form onSubmit={handleSubmit} className="flex items-center gap-2">
            <Input
              placeholder="Schreibe eine Nachricht..."
              value={input}
              onChange={handleInputChange}
            />
            <Button type="submit" size="icon" disabled={isLoading}>
              <SendHorizontal className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}