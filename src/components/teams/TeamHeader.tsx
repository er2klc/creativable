import { Users, Crown, Settings, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TeamLogoUpload } from "@/components/teams/TeamLogoUpload";
import { Separator } from "@/components/ui/separator";
import { useNavigate } from "react-router-dom";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useUser } from "@supabase/auth-helpers-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { TeamMemberList } from "./header/TeamMemberList";
import { TeamAdminList } from "./header/TeamAdminList";

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
      // First get team members
      const { data: memberData } = await supabase
        .from('team_members')
        .select('id, role, user_id')
        .eq('team_id', team.id);

      if (!memberData) return [];

      // Then get profiles for those members
      const memberIds = memberData.map(member => member.user_id);
      const { data: profileData } = await supabase
        .from('profiles')
        .select('id, email')
        .in('id', memberIds);

      // Combine the data and ensure we have profile data
      return memberData.map(member => {
        const profile = profileData?.find(p => p.id === member.user_id);
        return {
          ...member,
          profiles: profile || { email: member.user_id }  // Fallback to user_id if no email
        };
      });
    },
  });

  const { data: adminMembers } = useQuery({
    queryKey: ['team-admins', team.id],
    queryFn: async () => {
      // First get admin team members
      const { data: adminData } = await supabase
        .from('team_members')
        .select('id, role, user_id')
        .eq('team_id', team.id)
        .in('role', ['admin', 'owner']);

      if (!adminData) return [];

      // Then get profiles for those admins
      const adminIds = adminData.map(admin => admin.user_id);
      const { data: profileData } = await supabase
        .from('profiles')
        .select('id, email')
        .in('id', adminIds);

      // Combine the data and ensure we have profile data
      return adminData.map(admin => {
        const profile = profileData?.find(p => p.id === admin.user_id);
        return {
          ...admin,
          profiles: profile || { email: admin.user_id }  // Fallback to user_id if no email
        };
      });
    },
  });

  return (
    <div className="bg-background border-b">
      <div className="container py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {team.logo_url ? (
              <Avatar className="h-12 w-12">
                <AvatarImage src={team.logo_url} alt={team.name} />
                <AvatarFallback>{team.name.substring(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
            ) : (
              <Avatar className="h-12 w-12">
                <AvatarFallback>{team.name.substring(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
            )}
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-3xl font-semibold text-primary">
                  {team.name}
                </h1>
                {isAdmin && <TeamLogoUpload teamId={team.id} currentLogoUrl={team.logo_url} />}
              </div>
              <div className="flex items-center gap-4 mt-1 text-muted-foreground">
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="sm" className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <span>{members?.length || 0} Mitglieder</span>
                    </Button>
                  </SheetTrigger>
                  <SheetContent>
                    <SheetHeader>
                      <SheetTitle>Team Mitglieder</SheetTitle>
                      <SheetDescription>
                        Übersicht aller Mitglieder in diesem Team
                      </SheetDescription>
                    </SheetHeader>
                    <TeamMemberList members={members || []} isAdmin={isAdmin} />
                  </SheetContent>
                </Sheet>
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="sm" className="flex items-center gap-1">
                      <Crown className="h-4 w-4" />
                      <span>{adminMembers?.length || 0} Admins</span>
                    </Button>
                  </SheetTrigger>
                  <SheetContent>
                    <SheetHeader>
                      <SheetTitle>Team Administratoren</SheetTitle>
                      <SheetDescription>
                        Übersicht aller Administratoren in diesem Team
                      </SheetDescription>
                    </SheetHeader>
                    <TeamAdminList admins={adminMembers || []} />
                  </SheetContent>
                </Sheet>
                {isAdmin && (
                  <Sheet>
                    <SheetTrigger asChild>
                      <Button variant="outline" size="sm" className="ml-2">
                        <Settings className="h-4 w-4 mr-2" />
                        Mitglieder verwalten
                      </Button>
                    </SheetTrigger>
                    <SheetContent>
                      <SheetHeader>
                        <SheetTitle>Mitgliederverwaltung</SheetTitle>
                        <SheetDescription>
                          Hier können Sie Mitgliederrollen verwalten und neue Admins ernennen.
                        </SheetDescription>
                      </SheetHeader>
                      <TeamMemberList members={members || []} isAdmin={isAdmin} />
                    </SheetContent>
                  </Sheet>
                )}
              </div>
            </div>
          </div>
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