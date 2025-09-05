
import { TeamMember } from "./types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { useTeamPresence } from "@/components/teams/context/TeamPresenceContext";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { useChatParticipants } from "./hooks/useChatParticipants";

interface TeamChatListProps {
  teamId?: string;
  selectedUserId?: string;
  onSelectUser: (member: TeamMember) => void;
  unreadMessagesByUser: Record<string, number>;
}

export const TeamChatList = ({ 
  teamId,
  selectedUserId, 
  onSelectUser,
  unreadMessagesByUser = {}
}: TeamChatListProps) => {
  const { isOnline } = useTeamPresence();
  const { participants, removeParticipant } = useChatParticipants(teamId);

  if (!teamId) {
    return (
      <div className="w-[300px] border-r p-4 flex items-center justify-center text-center">
        <p className="text-muted-foreground text-sm">
          Wähle ein Team aus
        </p>
      </div>
    );
  }

  if (participants.length === 0) {
    return (
      <div className="w-[300px] border-r p-4 flex items-center justify-center text-center">
        <p className="text-muted-foreground text-sm">
          Keine aktiven Chats. Klicke auf "Nachricht senden" bei einem Teammitglied um einen Chat zu starten.
        </p>
      </div>
    );
  }

  const handleRemoveParticipant = (participantId: string) => {
    removeParticipant.mutate({ teamId, participantId });
  };

  return (
    <ScrollArea className="w-[300px] border-r">
      <div className="p-2 space-y-2">
        {participants.map((member) => {
          const unreadCount = unreadMessagesByUser[member.id] || 0;
          
          return (
            <div
              key={member.id}
              className={cn(
                "w-full flex items-center gap-3 p-2 rounded-lg hover:bg-accent transition-colors relative group",
                selectedUserId === member.id && "bg-accent"
              )}
            >
              <div className="relative">
                <Avatar>
                  <AvatarImage src={member.avatar_url || ""} />
                  <AvatarFallback>
                    {member.display_name?.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                {isOnline(member.id) && (
                  <span className="absolute bottom-0 right-0 w-3 h-3">
                    <span className="absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75 animate-ping" />
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500" />
                  </span>
                )}
              </div>
              <button
                onClick={() => onSelectUser(member)}
                className="flex flex-col items-start flex-1 text-left"
              >
                <span className="text-sm font-medium">
                  {member.display_name}
                </span>
              </button>
              {unreadCount > 0 && (
                <Badge 
                  variant="destructive" 
                  className="ml-2"
                >
                  {unreadCount}
                </Badge>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => handleRemoveParticipant(member.id)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          );
        })}
      </div>
    </ScrollArea>
  );
};
