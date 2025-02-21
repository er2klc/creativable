
import { TeamMember } from "./types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface TeamChatListProps {
  members: TeamMember[];
  selectedUserId?: string;
  onSelectUser: (member: TeamMember) => void;
  currentUserLevel?: number;
}

export const TeamChatList = ({ 
  members, 
  selectedUserId, 
  onSelectUser, 
  currentUserLevel 
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
            <div className="flex flex-col items-start">
              <span className="text-sm font-medium">
                {member.display_name}
              </span>
            </div>
          </button>
        ))}
      </div>
    </ScrollArea>
  );
};
