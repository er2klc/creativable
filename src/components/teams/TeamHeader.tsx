import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useUser } from "@supabase/auth-helpers-react";
import { TeamHeaderTitle } from "./header/TeamHeaderTitle";
import { TeamManagementButton } from "./header/TeamManagementButton";

interface TeamHeaderProps {
  team: {
    id: string;
    name: string;
    logo_url?: string;
  };
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

  const { data: members } = useQuery({
    queryKey: ['team-members', team.id],
    queryFn: async () => {
      const { data: memberData } = await supabase
        .from('team_members')
        .select('id, role, user_id')
        .eq('team_id', team.id);

      if (!memberData) return [];

      const memberIds = memberData.map(member => member.user_id);
      const { data: profileData } = await supabase
        .from('profiles')
        .select('id, email, display_name')
        .in('id', memberIds);

      return memberData.map(member => {
        const profile = profileData?.find(p => p.id === member.user_id);
        return {
          ...member,
          profiles: profile || { 
            email: 'Unbekannter Benutzer',
            display_name: null
          }
        };
      });
    },
  });

  const { data: adminMembers } = useQuery({
    queryKey: ['team-admins', team.id],
    queryFn: async () => {
      const { data: adminData } = await supabase
        .from('team_members')
        .select('id, role, user_id')
        .eq('team_id', team.id)
        .in('role', ['admin', 'owner']);

      if (!adminData) return [];

      const adminIds = adminData.map(admin => admin.user_id);
      const { data: profileData } = await supabase
        .from('profiles')
        .select('id, email, display_name')
        .in('id', adminIds);

      return adminData.map(admin => {
        const profile = profileData?.find(p => p.id === admin.user_id);
        return {
          ...admin,
          profiles: profile || { 
            email: 'Unbekannter Benutzer',
            display_name: null
          }
        };
      });
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