import { Separator } from "@/components/ui/separator";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useUser } from "@supabase/auth-helpers-react";
import { TeamHeaderTitle } from "./header/TeamHeaderTitle";
import { TeamActions } from "./header/TeamActions";
import { useState, useEffect } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface TeamHeaderProps {
  team: {
    id: string;
    name: string;
    logo_url?: string;
    created_by: string;
  };
  isInSnapView?: boolean;
}

export function TeamHeader({ team, isInSnapView = false }: TeamHeaderProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const user = useUser();

  useEffect(() => {
    if (isInSnapView) {
      setIsCollapsed(true);
    } else {
      setIsCollapsed(false);
    }
  }, [isInSnapView]);

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

  const { data: members = [] } = useQuery({
    queryKey: ['team-members', team.id],
    queryFn: async () => {
      const { data: teamMembers, error: membersError } = await supabase
        .from('team_members')
        .select(`
          id,
          role,
          user_id,
          profiles:user_id (
            id,
            display_name,
            avatar_url
          )
        `)
        .eq('team_id', team.id);

      if (membersError) {
        console.error('Error fetching team members:', membersError);
        return [];
      }

      return teamMembers;
    },
    enabled: !!team.id,
  });

  const adminMembers = members.filter(member => 
    member.role === 'admin' || member.role === 'owner'
  );

  const membersCount = members.length;
  const adminsCount = adminMembers.length;

  return (
    <div className={cn(
      "bg-background border-b transition-all duration-300 ease-in-out",
      isCollapsed ? "h-16" : "h-auto"
    )}>
      <div className="container py-4 relative">
        <div className={cn(
          "flex items-center justify-between transition-all duration-300",
          isCollapsed ? "opacity-0 pointer-events-none" : "opacity-100"
        )}>
          <TeamHeaderTitle 
            team={team}
            isAdmin={isAdmin}
            membersCount={membersCount}
            adminsCount={adminsCount}
            members={members}
            adminMembers={adminMembers}
          />
          <TeamActions 
            teamId={team.id}
            isAdmin={isAdmin}
            isOwner={isOwner}
            members={members}
          />
        </div>
        {isInSnapView && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={cn(
              "absolute right-4 transition-all duration-300",
              isCollapsed ? "bottom-2" : "-bottom-4"
            )}
          >
            {isCollapsed ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronUp className="h-4 w-4" />
            )}
          </Button>
        )}
        <Separator className={cn(
          "my-4 transition-opacity duration-300",
          isCollapsed ? "opacity-0" : "opacity-100"
        )} />
      </div>
    </div>
  );
}