
import { Separator } from "@/components/ui/separator";
import { useUser } from "@supabase/auth-helpers-react";
import { TeamHeaderTitle } from "./header/TeamHeaderTitle";
import { TeamActions } from "./header/TeamActions";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { NextTeamEvent } from "./events/NextTeamEvent";

interface TeamHeaderProps {
  team: {
    id: string;
    name: string;
    logo_url?: string;
    created_by: string;
    slug: string;
    members: any[];
    adminMembers: any[];
    stats: {
      totalMembers: number;
      admins: number;
      onlineCount: number;
      memberProgress: number;
      levelStats: {
        averageLevel: number;
        highestLevel: number;
        totalPoints: number;
      };
      roles: {
        owners: number;
        admins: number;
        members: number;
      };
    };
  };
  isInSnapView?: boolean;
}

export function TeamHeader({ team, isInSnapView = false }: TeamHeaderProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const user = useUser();

  // Update collapsed state based on snap view
  useEffect(() => {
    setIsCollapsed(isInSnapView);
  }, [isInSnapView]);

  const isAdmin = user?.id && (
    team.created_by === user.id ||
    team.adminMembers.some(member => member.user_id === user.id)
  );
  
  const isOwner = team.created_by === user?.id;

  return (
    <div className={cn(
      "bg-background border-b transition-all duration-300",
      isCollapsed ? "h-0 overflow-hidden" : ""
    )} 
    style={{ height: isCollapsed ? '0' : 'var(--header-height)' }}>
      <div className={cn(
        "container h-full flex items-center relative",
        isCollapsed ? "pointer-events-none" : ""
      )}>
        <div className={cn(
          "flex items-center justify-between w-full transition-all duration-300",
          isCollapsed ? "opacity-0" : "opacity-100"
        )}>
          <TeamHeaderTitle 
            team={{
              id: team.id,
              name: team.name,
              logo_url: team.logo_url
            }}
            members={team.members}
            adminMembers={team.adminMembers}
            stats={team.stats}
            isAdmin={isAdmin}
          />
          <TeamActions 
            teamId={team.id}
            isAdmin={isAdmin}
            isOwner={isOwner}
            members={team.members}
          />
        </div>
      </div>
    </div>
  );
}
