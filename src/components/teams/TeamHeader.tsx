
import { Separator } from "@/components/ui/separator";
import { useUser } from "@supabase/auth-helpers-react";
import { TeamHeaderTitle } from "./header/TeamHeaderTitle";
import { TeamActions } from "./header/TeamActions";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { NextTeamEvent } from "./events/NextTeamEvent";
import { useTeamStats } from "@/hooks/useTeamStats";

interface TeamHeaderProps {
  team: {
    id: string;
    name: string;
    logo_url?: string;
    created_by: string;
    slug: string;
  };
  isInSnapView?: boolean;
}

export function TeamHeader({ team, isInSnapView = false }: TeamHeaderProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const user = useUser();
  
  // Use the centralized useTeamStats hook
  const { 
    stats, 
    members, 
    adminMembers, 
    isLoading 
  } = useTeamStats(team.id);

  // Update collapsed state based on snap view
  useEffect(() => {
    setIsCollapsed(isInSnapView);
  }, [isInSnapView]);

  const isAdmin = user?.id && (
    team.created_by === user.id ||
    adminMembers.some(member => member.user_id === user.id)
  );
  
  const isOwner = team.created_by === user?.id;

  if (isLoading) {
    return (
      <div className="bg-background border-b h-[200px] animate-pulse" />
    );
  }

  return (
    <div className={cn(
      "bg-background border-b transition-all duration-300",
      isCollapsed ? "h-0 overflow-hidden" : "h-auto"
    )}>
      <div className={cn(
        "container py-4 relative",
        isCollapsed ? "pointer-events-none" : ""
      )}>
        <div className={cn(
          "flex items-center justify-between transition-all duration-300",
          isCollapsed ? "opacity-0" : "opacity-100"
        )}>
          <TeamHeaderTitle 
            team={team}
            isAdmin={isAdmin}
          />
          <TeamActions 
            teamId={team.id}
            isAdmin={isAdmin}
            isOwner={isOwner}
            members={members}
          />
        </div>
        
        <Separator className={cn(
          "my-4 transition-opacity duration-300",
          isCollapsed ? "opacity-0" : "opacity-100"
        )} />

        <div className={cn(
          "transition-all duration-300 flex justify-center",
          isCollapsed ? "opacity-0" : "opacity-100"
        )}>
          <NextTeamEvent teamId={team.id} teamSlug={team.slug} />
        </div>
      </div>
    </div>
  );
}
