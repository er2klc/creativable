
import { TeamMember } from "./types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

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
  unreadMessagesByUser 
}: TeamChatListProps) => {
  if (!currentUserLevel || currentUserLevel < 3) {
    return (
      <div className="w-[300px] border-r p-4 flex items-center justify-center text-center">
        <p className="text-muted-foreground text-sm">
          Du benötigst Level 3 um den Chat zu nutzen
        </p>
      </div>
    );
  }

  return (
    <ScrollArea className="w-[300px] border-r">
      <div className="p-2 space-y-2">
        {members.map((member) => (
          <button
            key={member.id}
            onClick={() => onSelectUser(member)}
            className={cn(
              "w-full flex items-center gap-3 p-2 rounded-lg hover:bg-accent transition-colors",
              selectedUserId === member.id && "bg-accent"
            )}
          >
            <Avatar>
              <AvatarImage src={member.avatar_url || ""} />
              <AvatarFallback>
                {member.display_name?.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col items-start flex-1">
              <span className="text-sm font-medium">
                {member.display_name}
              </span>
              {unreadMessagesByUser[member.id] > 0 && (
                <Badge 
                  variant="destructive" 
                  className="mt-1 text-xs h-5 min-w-[20px] flex items-center justify-center"
                >
                  {unreadMessagesByUser[member.id]}
                </Badge>
              )}
            </div>
          </button>
        ))}
      </div>
    </ScrollArea>
  );
};
