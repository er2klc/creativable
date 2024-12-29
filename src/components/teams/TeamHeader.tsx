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

interface TeamMemberResponse {
  id: string;
  role: string;
  user_id: string;
  profiles: {
    display_name: string | null;
    email: string | null;
  } | null;
}

interface TeamMember {
  id: string;
  role: string;
  user_id: string;
  display_name: string;
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
  });

  const { data: members } = useQuery<TeamMember[]>({
    queryKey: ['team-members', team.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('team_members')
        .select(`
          id,
          role,
          user_id,
          profiles:user_id (
            display_name,
            email
          )
        `)
        .eq('team_id', team.id);

      if (!data) return [];

      return data.map((member: any) => ({
        id: member.id,
        role: member.role,
        user_id: member.user_id,
        display_name: member.profiles?.display_name || member.profiles?.email || 'Unbekannter Benutzer'
      }));
    },
  });

  const { data: adminMembers } = useQuery<TeamMember[]>({
    queryKey: ['team-admins', team.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('team_members')
        .select(`
          id,
          role,
          user_id,
          profiles:user_id (
            display_name,
            email
          )
        `)
        .eq('team_id', team.id)
        .in('role', ['admin', 'owner']);

      if (!data) return [];

      return data.map((admin: any) => ({
        id: admin.id,
        role: admin.role,
        user_id: admin.user_id,
        display_name: admin.profiles?.display_name || admin.profiles?.email || 'Unbekannter Benutzer'
      }));
    },
  });

  return (
    <div className="bg-background border-b">
      <div className="container py-4">
        <div className="flex items-center justify-between">
          <TeamHeaderTitle 
            team={team}
            isAdmin={isAdmin || false}
            membersCount={members?.length || 0}
            adminsCount={adminMembers?.length || 0}
            members={members || []}
            adminMembers={adminMembers || []}
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