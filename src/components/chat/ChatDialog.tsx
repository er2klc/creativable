import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { MessageCircle, Send } from "lucide-react";
import { useChat } from "ai/react";
import { useSettings } from "@/hooks/use-settings";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

export const ChatDialog = () => {
  const { settings } = useSettings();
  const apiKey = settings?.openai_api_key;
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: '/functions/v1/chat',
    headers: {
      'X-OpenAI-Key': apiKey || '',
    },
    body: {
      language: 'de',
    },
    onResponse: (response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    },
    onFinish: () => {
      // Handle chat completion if needed
    },
    onError: (error) => {
      console.error("Chat error:", error);
      // Don't show error toast for parsing errors as they don't affect functionality
      if (!error.message.includes('Failed to parse')) {
        toast({
          title: "Fehler",
          description: "Fehler beim Senden der Nachricht. Bitte versuchen Sie es später erneut.",
          variant: "destructive",
        });
      }
    },
  });

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 h-12 w-12 rounded-full shadow-lg"
      >
        <MessageCircle className="h-6 w-6" />
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <div className="flex flex-col h-[600px]">
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "flex w-max max-w-[80%] flex-col gap-2 rounded-lg px-3 py-2 text-sm",
                    message.role === "user"
                      ? "ml-auto bg-primary text-primary-foreground"
                      : "bg-muted"
                  )}
                >
                  {message.content}
                </div>
              ))}
            </div>

            <form
              onSubmit={handleSubmit}
              className="flex items-center gap-2 border-t p-4"
            >
              <input
                className="flex-1 px-3 py-2 bg-background border rounded-md"
                value={input}
                placeholder="Schreiben Sie eine Nachricht..."
                onChange={handleInputChange}
              />
              <Button type="submit" size="icon" disabled={isLoading}>
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};