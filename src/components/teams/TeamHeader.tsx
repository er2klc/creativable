import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useUser } from "@supabase/auth-helpers-react";
import { TeamHeaderTitle } from "./header/TeamHeaderTitle";

interface TeamHeaderProps {
  team: {
    id: string;
    name: string;
    logo_url?: string;
  };
}

interface TeamMember {
  id: string;
  role: string;
  user_id: string;
  display_name: string | null;
}

export function TeamHeader({ team }: TeamHeaderProps) {
  const navigate = useNavigate();
  const user = useUser();

  const { data: isAdmin } = useQuery({
    queryKey: ['team-member-role', team.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('team_members')
        .select('role')
        .eq('team_id', team.id)
        .eq('user_id', user?.id)
        .maybeSingle();

      return data?.role === 'admin' || data?.role === 'owner';
    },
    enabled: !!user?.id && !!team.id,
  });

  const { data: members } = useQuery<TeamMember[]>({
    queryKey: ['team-members', team.id],
    queryFn: async () => {
      const { data: teamMembers, error } = await supabase
        .from('team_members')
        .select('id, role, user_id')
        .eq('team_id', team.id);

      if (error) {
        console.error('Error fetching team members:', error);
        return [];
      }

      const memberIds = teamMembers.map(member => member.user_id);
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, display_name')
        .in('id', memberIds);

      const profileMap = new Map(profiles?.map(p => [p.id, p.display_name]) || []);

      return teamMembers.map(member => ({
        id: member.id,
        role: member.role,
        user_id: member.user_id,
        display_name: profileMap.get(member.user_id) || 'Unbekannter Benutzer'
      }));
    },
    enabled: !!team.id,
  });

  // Filter admins from the full members list
  const adminMembers = members?.filter(member => 
    member.role === 'admin' || member.role === 'owner'
  ) || [];

  // Calculate counts
  const membersCount = members?.length || 0;
  const adminsCount = adminMembers.length;

  console.log('Members:', members);
  console.log('Admin Members:', adminMembers);
  console.log('Current team ID:', team.id);

  return (
    <div className="bg-background border-b">
      <div className="container py-4">
        <div className="flex items-center justify-between">
          <TeamHeaderTitle 
            team={team}
            isAdmin={isAdmin || false}
            membersCount={membersCount}
            adminsCount={adminsCount}
            members={members || []}
            adminMembers={adminMembers}
          />
          <Button
            variant="ghost"
            onClick={() => navigate('/unity')}
            className="text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </div>
        <Separator className="my-4" />
      </div>
    </div>
  );
}