
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useRef, useState } from "react";
import { TeamChatHeader } from "./TeamChatHeader";
import { TeamChatMessages } from "./TeamChatMessages";
import { TeamChatInput } from "./TeamChatInput";
import { TeamChatList } from "./TeamChatList";
import { useTeamChat } from "./hooks/useTeamChat";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { TeamMember } from "@/integrations/supabase/types/leads";

interface TeamChatDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TeamChatDialog({ open, onOpenChange }: TeamChatDialogProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  const [teamId, setTeamId] = useState<string | undefined>(undefined);
  
  const { 
    selectedUser,
    messages,
    isLoading,
    sendMessage,
    selectUser,
    teamMembers,
    currentUserLevel 
  } = useTeamChat();

  const handleClose = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className={cn(
          "flex flex-col p-0 gap-0 bg-background overflow-hidden",
          isMobile 
            ? "w-full h-[100dvh] max-w-full m-0 rounded-none" 
            : "sm:max-w-[800px] h-[80vh]"
        )}
        hideClose
      >
        <TeamChatHeader onClose={handleClose} selectedUser={selectedUser} />
        
        <div className="flex-1 flex min-h-0">
          <TeamChatList 
            teamId={teamId}
            selectedUserId={selectedUser?.id}
            onSelectUser={selectUser}
            unreadMessagesByUser={{}}
          />
          
          <div className="flex-1 flex flex-col min-w-0 border-l">
            {selectedUser ? (
              <>
                <TeamChatMessages 
                  messages={messages} 
                  scrollRef={scrollRef}
                  isLoading={isLoading} 
                />
                <TeamChatInput onSendMessage={sendMessage} autoFocus={true} />
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <p className="text-muted-foreground">
                  Wähle einen Chat-Partner aus der Liste
                </p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
