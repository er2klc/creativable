import { Separator } from "@/components/ui/separator";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useUser } from "@supabase/auth-helpers-react";
import { TeamHeaderTitle } from "./header/TeamHeaderTitle";
import { TeamActions } from "./header/TeamActions";
import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface TeamHeaderProps {
  team: {
    id: string;
    name: string;
    logo_url?: string;
    created_by: string;
  };
}

export function TeamHeader({ team }: TeamHeaderProps) {
  const user = useUser();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const isInSnap = location.hash !== "";

  useEffect(() => {
    setIsCollapsed(isInSnap);
  }, [isInSnap]);

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

  const handleBackToSnaps = () => {
    window.location.hash = "";
    setIsCollapsed(false);
  };

  return (
    <div className={cn(
      "bg-background border-b transition-all duration-300 ease-in-out",
      isCollapsed ? "h-16" : "h-auto"
    )}>
      <div className="container py-4">
        <div className="flex items-center justify-between">
          {isInSnap && (
            <Button 
              variant="ghost" 
              className="mr-4"
              onClick={handleBackToSnaps}
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Zurück zu Snaps
            </Button>
          )}
          <div className={cn(
            "flex-1 transition-all duration-300",
            isCollapsed ? "opacity-0 invisible" : "opacity-100 visible"
          )}>
            <TeamHeaderTitle 
              team={team}
              isAdmin={isAdmin}
              membersCount={membersCount}
              adminsCount={adminsCount}
              members={members}
              adminMembers={adminMembers}
            />
          </div>
          <TeamActions 
            teamId={team.id}
            isAdmin={isAdmin}
            isOwner={isOwner}
            members={members}
          />
        </div>
        <Separator className={cn(
          "my-4 transition-all duration-300",
          isCollapsed ? "opacity-0" : "opacity-100"
        )} />
      </div>
    </div>
  );
}