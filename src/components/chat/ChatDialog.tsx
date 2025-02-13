
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useRef, useState } from "react";
import { useChatContext } from "@/hooks/use-chat-context";
import { ChatHeader } from "./ChatHeader";
import { ChatMessages } from "./ChatMessages";
import { ChatInput } from "./ChatInput";
import { useChatSetup } from "./hooks/useChatSetup";
import { useChatMessages } from "./hooks/useChatMessages";
import { useIsMobile } from "@/hooks/use-mobile";
import { Tables } from "@/integrations/supabase/types";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ChatContactList } from "./contact-selection/ChatContactList";
import { useChatTemplates } from "@/hooks/use-chat-templates";

interface ChatDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ChatDialog({ open, onOpenChange }: ChatDialogProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { systemMessage } = useChatContext();
  const isMobile = useIsMobile();
  const [selectedContact, setSelectedContact] = useState<Tables<"leads"> | null>(null);

  const {
    sessionToken,
    apiKey,
    isReady,
    userId,
    currentTeamId,
  } = useChatSetup(open);

  const { data: contacts = [] } = useQuery({
    queryKey: ['leads'],
    queryFn: async () => {
      if (!userId) return [];
      
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .eq('user_id', userId)
        .order('name');
      
      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });

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
    setSelectedContact(null);
  };

  if (!isReady) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className={isMobile ? "w-full h-full max-w-full m-0 p-0 rounded-none" : "sm:max-w-[500px]"}>
          <ChatHeader onMinimize={onOpenChange} onClose={handleClose} />
          <div className="flex items-center justify-center h-[600px]">
            <p className="text-muted-foreground">Initialisiere Chat...</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const showContactList = messages.length === 0 || 
    messages[messages.length - 1]?.content?.toLowerCase().includes('nachricht') ||
    messages[messages.length - 1]?.content?.toLowerCase().includes('schreib');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className={isMobile ? "w-full h-full max-w-full m-0 p-0 rounded-none" : "sm:max-w-[500px]"}
        onClick={handleDialogClick} 
        hideClose
      >
        <ChatHeader onMinimize={onOpenChange} onClose={handleClose} />
        <div className={`flex flex-col ${isMobile ? "h-[calc(100vh-4rem)]" : "h-[600px]"}`}>
          <ChatMessages messages={messages} scrollRef={scrollRef} />
          {showContactList && (
            <ChatContactList
              contacts={contacts}
              onSelect={setSelectedContact}
              selectedId={selectedContact?.id}
            />
          )}
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
