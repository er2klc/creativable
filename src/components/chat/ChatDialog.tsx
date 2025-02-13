
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useRef } from "react";
import { useChatContext } from "@/hooks/use-chat-context";
import { ChatHeader } from "./ChatHeader";
import { ChatMessages } from "./ChatMessages";
import { ChatInput } from "./ChatInput";
import { useChatSetup } from "./hooks/useChatSetup";
import { useChatMessages } from "./hooks/useChatMessages";
import { useIsMobile } from "@/hooks/use-mobile";
import { ChatContactList } from "./contact-selection/ChatContactList";
import { useChatFlow } from "./hooks/useChatFlow";
import { MessageTemplateSelector } from "./template-selection/MessageTemplateSelector";
import { MessagePreview } from "./message-preview/MessagePreview";
import { cn } from "@/lib/utils";

interface ChatDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ChatDialog({ open, onOpenChange }: ChatDialogProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { systemMessage } = useChatContext();
  const isMobile = useIsMobile();

  const {
    sessionToken,
    apiKey,
    isReady,
    userId,
    currentTeamId,
  } = useChatSetup(open);

  const {
    flowState,
    selectedContact,
    selectedTemplateType,
    contacts,
    handleUserMessage,
    handleContactSelection,
    handleTemplateSelection,
    generateTemplateMessage,
    reset
  } = useChatFlow(userId);

  const {
    messages,
    input,
    handleInputChange,
    handleSubmit: originalHandleSubmit,
    resetMessages
  } = useChatMessages({
    sessionToken,
    apiKey,
    userId,
    currentTeamId,
    systemMessage
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const isMessageCommand = handleUserMessage(input);
    if (!isMessageCommand) {
      await originalHandleSubmit(e);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    resetMessages();
    reset();
  };

  if (!isReady) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent 
          className={cn(
            "p-0 gap-0 bg-background",
            isMobile ? "w-full h-[100dvh] max-w-full m-0 rounded-none" : "sm:max-w-[700px] h-[80vh]"
          )}
        >
          <ChatHeader onMinimize={onOpenChange} onClose={handleClose} />
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground">Initialisiere Chat...</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const renderFlowContent = () => {
    switch (flowState) {
      case 'contact_selection':
        return (
          <ChatContactList
            contacts={contacts}
            onSelect={handleContactSelection}
            selectedId={selectedContact?.id}
          />
        );
      case 'template_selection':
        return (
          <div className="min-h-[120px] border-t bg-background">
            <MessageTemplateSelector
              onSelect={handleTemplateSelection}
              selectedType={selectedTemplateType}
            />
          </div>
        );
      case 'message_preview':
        const templateMessage = generateTemplateMessage();
        if (templateMessage) {
          return (
            <div className="min-h-[120px] border-t bg-background">
              <MessagePreview
                message={templateMessage}
                onEdit={() => setFlowState('template_selection')}
                onSend={async () => {
                  await originalHandleSubmit({
                    preventDefault: () => {},
                  } as React.FormEvent, templateMessage);
                  reset();
                }}
              />
            </div>
          );
        }
        return null;
      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className={cn(
          "p-0 gap-0 bg-background",
          isMobile 
            ? "w-full h-[100dvh] max-w-full m-0 rounded-none" 
            : "sm:max-w-[700px] h-[80vh]",
          "flex flex-col"
        )}
        onClick={(e) => e.stopPropagation()} 
        hideClose
      >
        <ChatHeader onMinimize={onOpenChange} onClose={handleClose} />
        <div className="flex flex-col flex-1 min-h-0 h-full">
          <div className="flex-1 min-h-0 overflow-hidden relative">
            <ChatMessages messages={messages} scrollRef={scrollRef} />
          </div>
          {renderFlowContent()}
          <div className="sticky bottom-0 bg-background border-t pt-4 pb-4 px-4">
            <ChatInput 
              input={input}
              handleInputChange={handleInputChange}
              handleSubmit={handleSubmit}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
