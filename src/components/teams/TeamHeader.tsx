
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";

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
  const maxMembers = 100; // TODO: Get from team settings
  const memberProgress = (membersCount / maxMembers) * 100;

  return (
    <div 
      className={cn(
        "relative overflow-hidden transition-all duration-300 ease-in-out bg-[#222]",
        isCollapsed ? "h-16" : "h-auto"
      )}
    >
      {/* Background with gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#222]/95 to-transparent" />

      {/* Content */}
      <div className={cn(
        "container relative z-10 py-6",
        isCollapsed ? "pointer-events-none" : ""
      )}>
        <div className={cn(
          "transition-all duration-300",
          isCollapsed ? "opacity-0" : "opacity-100"
        )}>
          {/* Header Content */}
          <div className="flex items-start justify-between gap-6">
            {/* Team Info */}
            <div className="flex items-center gap-6">
              <Avatar className="h-24 w-24 border-2 border-white/10">
                {team.logo_url ? (
                  <AvatarImage src={team.logo_url} alt={team.name} className="object-cover" />
                ) : (
                  <AvatarFallback className="text-2xl bg-[#333]">
                    {team.name.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                )}
              </Avatar>
              
              <div className="space-y-2">
                <h1 className="text-3xl font-bold text-white/90">{team.name}</h1>
                <div className="flex items-center gap-4 text-sm text-gray-300/90">
                  <TeamHeaderTitle 
                    team={team}
                    isAdmin={isAdmin}
                    membersCount={membersCount}
                    adminsCount={adminsCount}
                    members={members}
                    adminMembers={adminMembers}
                  />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-start gap-4">
              <TeamActions 
                teamId={team.id}
                isAdmin={isAdmin}
                isOwner={isOwner}
                members={members}
              />
            </div>
          </div>

          {/* Stats Bar */}
          <div className="mt-6 bg-black/20 backdrop-blur-sm rounded-lg p-4 border border-white/10">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Members Progress */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-gray-300/90">
                  <span>Mitglieder</span>
                  <span>{membersCount}/{maxMembers}</span>
                </div>
                <Progress value={memberProgress} className="h-2 bg-gray-700/50" />
              </div>

              {/* Admin Stats */}
              <div className="flex items-center gap-4 text-sm text-gray-300/90">
                <span>{adminsCount} Admins</span>
                <span>•</span>
                <span>{membersCount - adminsCount} Members</span>
              </div>

              {/* Additional Stats or Info */}
              <div className="flex justify-end">
                {isOwner && (
                  <span className="bg-yellow-900/30 text-yellow-200/90 px-3 py-1 rounded-full text-sm font-medium">
                    Team Owner
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Collapse Toggle Button */}
        {isInSnapView && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={cn(
              "absolute right-4 transition-all duration-300 pointer-events-auto",
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
