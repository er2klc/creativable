
import { TeamMember } from "./types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { useTeamPresence } from "@/components/teams/context/TeamPresenceContext";

interface TeamChatListProps {
  members: TeamMember[];
  selectedUserId?: string;
  onSelectUser: (member: TeamMember) => void;
  currentUserLevel?: number;
  unreadMessagesByUser: Record<string, number>;
}

export const TeamChatList = ({ 
  members, 
  selectedUserId, 
  onSelectUser, 
  currentUserLevel,
  unreadMessagesByUser = {}
}: TeamChatListProps) => {
  const { isOnline } = useTeamPresence();

  if (!currentUserLevel || currentUserLevel < 3) {
    return (
      <div className="w-[300px] border-r p-4 flex items-center justify-center text-center">
        <p className="text-muted-foreground text-sm">
          Du benötigst Level 3 um den Chat zu nutzen
        </p>
      </div>
    );
  }

  // Sortiere Mitglieder nach:
  // 1. Ungelesene Nachrichten
  // 2. Online Status
  // 3. Level
  // 4. Name
  const sortedMembers = [...members].sort((a, b) => {
    const aUnread = unreadMessagesByUser[a.id] || 0;
    const bUnread = unreadMessagesByUser[b.id] || 0;
    
    if (aUnread !== bUnread) return bUnread - aUnread;
    
    const aOnline = isOnline(a.id);
    const bOnline = isOnline(b.id);
    if (aOnline !== bOnline) return bOnline ? 1 : -1;
    
    if (a.level !== b.level) return b.level - a.level;
    
    return (a.display_name || '').localeCompare(b.display_name || '');
  });

  return (
    <ScrollArea className="w-[300px] border-r">
      <div className="p-2 space-y-2">
        {sortedMembers.map((member) => {
          const unreadCount = unreadMessagesByUser[member.id] || 0;
          
          return (
            <button
              key={member.id}
              onClick={() => onSelectUser(member)}
              className={cn(
                "w-full flex items-center gap-3 p-2 rounded-lg hover:bg-accent transition-colors relative",
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
              <div className="flex flex-col items-start flex-1">
                <span className="text-sm font-medium">
                  {member.display_name}
                </span>
                <span className="text-xs text-muted-foreground">
                  Level {member.level}
                </span>
                {unreadCount > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="mt-1 text-xs h-5 min-w-[20px] flex items-center justify-center"
                  >
                    {unreadCount}
                  </Badge>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </ScrollArea>
  );
};
