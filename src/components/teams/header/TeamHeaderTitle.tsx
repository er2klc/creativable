import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { TeamMemberList } from "./TeamMemberList";
import { TeamAdminList } from "./TeamAdminList";

interface TeamHeaderTitleProps {
  team: {
    id: string;
    name: string;
    logo_url?: string;
  };
  isAdmin: boolean;
  membersCount: number;
  adminsCount: number;
  members: {
    id: string;
    role: string;
    user_id: string;
    profiles: {
      id: string;
      display_name: string;
      avatar_url: string;
    };
  }[];
  adminMembers: {
    id: string;
    role: string;
    user_id: string;
    profiles: {
      id: string;
      display_name: string;
      avatar_url: string;
    };
  }[];
}

export function TeamHeaderTitle({
  team,
  isAdmin,
  membersCount,
  adminsCount,
  members,
  adminMembers,
}: TeamHeaderTitleProps) {
  return (
    <div className="flex items-center gap-4">
      <Avatar className="h-12 w-12">
        <AvatarImage src={team.logo_url || ""} alt={team.name} />
        <AvatarFallback>{team.name.charAt(0)}</AvatarFallback>
      </Avatar>
      <div>
        <h1 className="text-2xl font-bold">{team.name}</h1>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <HoverCard>
            <HoverCardTrigger className="hover:text-foreground cursor-pointer">
              {membersCount} {membersCount === 1 ? "Mitglied" : "Mitglieder"}
            </HoverCardTrigger>
            <HoverCardContent align="start" className="w-80">
              <TeamMemberList members={members} isAdmin={isAdmin} />
            </HoverCardContent>
          </HoverCard>
          <span>•</span>
          <HoverCard>
            <HoverCardTrigger className="hover:text-foreground cursor-pointer">
              {adminsCount} {adminsCount === 1 ? "Admin" : "Admins"}
            </HoverCardTrigger>
            <HoverCardContent align="start" className="w-80">
              <TeamAdminList adminMembers={adminMembers} />
            </HoverCardContent>
          </HoverCard>
        </div>
      </div>
    </div>
  );
}