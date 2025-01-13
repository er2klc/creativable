import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useRef } from "react";
import { useChatContext } from "@/hooks/use-chat-context";
import { ChatHeader } from "./ChatHeader";
import { ChatMessages } from "./ChatMessages";
import { ChatInput } from "./ChatInput";
import { useChatSetup } from "./hooks/useChatSetup";
import { useChatMessages } from "./hooks/useChatMessages";

interface ChatDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ChatDialog({ open, onOpenChange }: ChatDialogProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { systemMessage } = useChatContext();

  const {
    sessionToken,
    apiKey,
    isReady,
    userId,
    currentTeamId,
  } = useChatSetup(open);

  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    resetMessages
  } = useChatMessages({
    sessionToken,
    apiKey,
    userId,
    currentTeamId,
    systemMessage
  });

  const handleDialogClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const handleClose = () => {
    onOpenChange(false);
    resetMessages();
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