
import { Separator } from "@/components/ui/separator";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useUser } from "@supabase/auth-helpers-react";
import { TeamHeaderTitle } from "./header/TeamHeaderTitle";
import { TeamActions } from "./header/TeamActions";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { NextTeamEvent } from "./events/NextTeamEvent";
import { MEMBERS_QUERY, transformMemberData } from "@/hooks/use-team-members";

interface TeamStats {
  totalMembers: number;
  admins: number;
}

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

  // Update collapsed state based on snap view
  useEffect(() => {
    setIsCollapsed(isInSnapView);
  }, [isInSnapView]);

  // Fetch member role for current user
  const { data: memberRole } = useQuery({
    queryKey: ['team-member-role', team.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from('team_members')
        .select('role')
        .eq('team_id', team.id)
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching member role:', error);
        return null;
      }

      return data?.role;
    },
    enabled: !!user?.id && !!team.id,
  });

  const isAdmin = memberRole === 'admin' || memberRole === 'owner';
  const isOwner = team.created_by === user?.id;

  // Fetch all team members with their profile and points data
  const { data: members = [] } = useQuery({
    queryKey: ['team-members', team.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('team_members')
        .select(MEMBERS_QUERY)
        .eq('team_id', team.id);

      if (error) {
        console.error('Error fetching team members:', error);
        return [];
      }

      return data.map(transformMemberData);
    },
    enabled: !!team.id
  });

  // Calculate team stats
  const stats: TeamStats = {
    totalMembers: members.length,
    admins: members.filter(member => 
      member.role === 'admin' || member.role === 'owner'
    ).length
  };

  // Filter admin members
  const adminMembers = members.filter(member => 
    member.role === 'admin' || member.role === 'owner'
  );

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
            members={members}
            adminMembers={adminMembers}
            stats={stats}
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
