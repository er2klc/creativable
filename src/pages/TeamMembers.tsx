
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { TeamHeader } from "@/components/teams/TeamHeader";
import { Users, Crown, Shield, User } from "lucide-react";
import { cn } from "@/lib/utils";

const TeamMembers = () => {
  const navigate = useNavigate();
  const { teamSlug } = useParams();

  const { data: team, isLoading: isTeamLoading } = useQuery({
    queryKey: ['team', teamSlug],
    queryFn: async () => {
      if (!teamSlug) throw new Error("No team slug provided");
      
      const { data, error } = await supabase
        .from('teams')
        .select(`
          id, 
          name, 
          slug,
          created_by
        `)
        .eq('slug', teamSlug)
        .single();

      if (error) throw error;
      if (!data) throw new Error("Team not found");

      return data;
    },
    enabled: !!teamSlug
  });

  const { data: members = [], isLoading: isMembersLoading } = useQuery({
    queryKey: ['team-members', team?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('team_members')
        .select(`
          id,
          role,
          user_id,
          profiles:user_id (
            id,
            display_name,
            avatar_url,
            slug,
            status
          ),
          team_member_points (
            level,
            points
          )
        `)
        .eq('team_id', team.id);

      if (error) throw error;
      return data || [];
    },
    enabled: !!team?.id
  });

  if (isTeamLoading || isMembersLoading) {
    return <div className="p-4">Lädt...</div>;
  }

  if (!team) {
    return <div className="p-4">Team nicht gefunden</div>;
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'owner':
        return <Crown className="h-4 w-4 text-orange-500" />;
      case 'admin':
        return <Shield className="h-4 w-4 text-purple-500" />;
      default:
        return <User className="h-4 w-4 text-gray-600" />;
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'owner':
        return 'default';
      case 'admin':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'owner':
        return 'Owner';
      case 'admin':
        return 'Admin';
      default:
        return 'Mitglied';
    }
  };

  return (
    <div>
      <TeamHeader 
        team={team}
        userEmail={undefined}
      />
      <div className="container py-8">
        <div className="flex items-center gap-3 mb-6">
          <Users className="h-6 w-6" />
          <h1 className="text-2xl font-semibold">Teammitglieder</h1>
          <Badge variant="outline" className="ml-2">
            {members.length} Mitglieder
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {members.map((member) => (
            <Card 
              key={member.id} 
              className="p-4 cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => navigate(`/unity/team/${teamSlug}/members/${member.profiles?.slug}`)}
            >
              <div className="flex items-start space-x-4">
                <div className="relative">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={member.profiles?.avatar_url || undefined} />
                    <AvatarFallback>
                      {member.profiles?.display_name?.substring(0, 2).toUpperCase() || '??'}
                    </AvatarFallback>
                  </Avatar>
                  <div 
                    className={cn(
                      "absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-background",
                      member.profiles?.status === 'online' ? "bg-green-500" : "bg-gray-300"
                    )}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">
                    {member.profiles?.display_name || 'Unbekannt'}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge 
                      variant={getRoleBadgeVariant(member.role)} 
                      className="px-2 py-0 flex items-center gap-1"
                    >
                      {getRoleIcon(member.role)}
                      <span>{getRoleLabel(member.role)}</span>
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1 mt-2 text-sm text-muted-foreground">
                    <span>Level {member.team_member_points?.[0]?.level || 1}</span>
                    <span>•</span>
                    <span>{member.team_member_points?.[0]?.points || 0} Punkte</span>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TeamMembers;
