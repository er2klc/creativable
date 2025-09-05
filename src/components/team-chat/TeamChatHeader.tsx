
import { X } from "lucide-react";
import { DialogTitle } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { TeamMember } from "./types";
import { TeamSwitcher } from "./TeamSwitcher";

interface TeamChatHeaderProps {
  onClose: () => void;
  selectedUser?: TeamMember | null;
}

export const TeamChatHeader = ({ onClose, selectedUser }: TeamChatHeaderProps) => {
  return (
    <div className="flex flex-col">
      <div className="flex items-center gap-3 p-2">
        <TeamSwitcher />
        
        {selectedUser && (
          <>
            <span className="text-muted-foreground">/</span>
            <Avatar className="h-8 w-8">
              <AvatarImage src={selectedUser.avatar_url} />
              <AvatarFallback>
                {selectedUser.display_name?.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <DialogTitle className="flex-1">
              {selectedUser.display_name}
            </DialogTitle>
          </>
        )}
        
        <div className="flex items-center gap-2 ml-auto">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={onClose}
                  className="text-muted-foreground hover:text-destructive transition-colors p-1"
                >
                  <X className="h-4 w-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Schließen</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
      <div className="h-px bg-border" />
    </div>
  );
}
