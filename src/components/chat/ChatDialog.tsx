import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useChat } from "ai/react";
import { useRef } from "react";
import { useChatContext } from "@/hooks/use-chat-context";
import { ChatHeader } from "./ChatHeader";
import { ChatMessages } from "./ChatMessages";
import { ChatInput } from "./ChatInput";
import { useChatSetup } from "./hooks/useChatSetup";
import { useChatConfig } from "./hooks/useChatConfig";

interface ChatDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ChatDialog({ open, onOpenChange }: ChatDialogProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { systemMessage } = useChatContext();

  const { messages, input, handleInputChange, handleSubmit, setMessages } = useChat({
    api: `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`,
    initialMessages: [
      {
        id: "system",
        role: "system" as const,
        content: systemMessage,
      }
    ]
  });

  const {
    sessionToken,
    apiKey,
    isReady,
    userId,
    currentTeamId,
  } = useChatSetup(open, systemMessage, setMessages, messages);

  const chatConfig = useChatConfig(
    sessionToken,
    apiKey,
    userId,
    currentTeamId,
    systemMessage,
    scrollRef,
    messages
  );

  const handleDialogClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const handleClose = () => {
    onOpenChange(false);
    setMessages([
      {
        id: "system",
        role: "system" as const,
        content: systemMessage,
      }
    ]);
  };

  if (!isReady) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[500px]">
          <ChatHeader onMinimize={onOpenChange} onClose={handleClose} />
          <div className="flex items-center justify-center h-[600px]">
            <p className="text-muted-foreground">Initialisiere Chat...</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]" onClick={handleDialogClick} hideClose>
        <ChatHeader onMinimize={onOpenChange} onClose={handleClose} />
        <div className="flex flex-col h-[600px]">
          <ChatMessages messages={messages} scrollRef={scrollRef} />
          <ChatInput 
            input={input}
            handleInputChange={handleInputChange}
            handleSubmit={handleSubmit}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}