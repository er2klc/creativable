
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { TeamMember } from "./types";
import { useTeamPresence } from "@/components/teams/context/TeamPresenceContext";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { de } from "date-fns/locale";

interface TeamChatListProps {
  members: TeamMember[];
  selectedUserId?: string;
  onSelectUser: (user: TeamMember) => void;
}

export const TeamChatList = ({ members, selectedUserId, onSelectUser }: TeamChatListProps) => {
  const { isOnline } = useTeamPresence();

  return (
    <div className="w-[280px] border-r flex flex-col">
      <div className="p-2 border-b">
        <h3 className="text-sm font-semibold px-2">Team Mitglieder</h3>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {members.map((member) => (
            <button
              key={member.id}
              onClick={() => onSelectUser(member)}
              className={cn(
                "w-full flex items-center gap-3 p-2 rounded-md hover:bg-accent transition-colors",
                selectedUserId === member.id && "bg-accent"
              )}
            >
              <div className="relative">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={member.avatar_url || ''} />
                  <AvatarFallback>
                    {member.display_name?.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div 
                  className={cn(
                    "absolute bottom-0 right-0 h-2 w-2 rounded-full border border-background",
                    isOnline(member.id) ? "bg-green-500" : "bg-gray-300"
                  )} 
                />
              </div>
              <div className="flex-1 text-left">
                <div className="text-sm font-medium truncate">
                  {member.display_name}
                </div>
                {member.last_seen && !isOnline(member.id) && (
                  <div className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(member.last_seen), { 
                      addSuffix: true,
                      locale: de 
                    })}
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
