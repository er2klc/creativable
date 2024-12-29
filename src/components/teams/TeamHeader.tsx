import { Infinity, Users, Crown, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TeamLogoUpload } from "@/components/teams/TeamLogoUpload";
import { Separator } from "@/components/ui/separator";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
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

interface TeamHeaderProps {
  team: {
    id: string;
    name: string;
    logo_url?: string;
  };
  teamStats?: {
    totalMembers: number;
    admins: number;
  };
}

export function TeamHeader({ team, teamStats }: TeamHeaderProps) {
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
        .single();
      
      return data?.role === 'admin' || data?.role === 'owner';
    },
  });

  const { data: members } = useQuery({
    queryKey: ['team-members', team.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('team_members')
        .select(`
          id,
          user_id,
          role,
          profiles:profiles!team_members_user_id_fkey (
            id,
            email
          )
        `)
        .eq('team_id', team.id);
      
      return data;
    },
  });

  const { data: adminMembers } = useQuery({
    queryKey: ['team-admins', team.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('team_members')
        .select(`
          id,
          role,
          profiles:profiles!team_members_user_id_fkey (
            id,
            email
          )
        `)
        .eq('team_id', team.id)
        .in('role', ['admin', 'owner']);
      
      return data;
    },
  });

  return (
    <div className="bg-background border-b">
      <div className="container py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Infinity className="h-8 w-8 text-primary" />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-3xl font-semibold text-primary">
                  {team.name}
                </h1>
                <TeamLogoUpload teamId={team.id} currentLogoUrl={team.logo_url} />
              </div>
              <div className="flex items-center gap-4 mt-1 text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  <span>{members?.length || 0} Mitglieder</span>
                </div>
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
                    <div className="mt-4 space-y-4">
                      {members?.filter(member => ['admin', 'owner'].includes(member.role)).map((admin) => (
                        <div key={admin.id} className="flex items-center justify-between p-2 border rounded">
                          <div className="flex items-center gap-2">
                            <Badge variant={admin.role === 'owner' ? 'default' : 'secondary'}>
                              {admin.role === 'owner' ? 'Owner' : 'Admin'}
                            </Badge>
                            <span className="text-sm">{admin.profiles?.email}</span>
                          </div>
                        </div>
                      ))}
                    </div>
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
                      <div className="mt-4 space-y-4">
                        {members?.map((member) => (
                          <div key={member.id} className="flex items-center justify-between p-2 border rounded">
                            <div className="flex items-center gap-2">
                              <Badge variant={member.role === 'owner' ? 'default' : 'secondary'}>
                                {member.role === 'owner' ? 'Owner' : member.role === 'admin' ? 'Admin' : 'Mitglied'}
                              </Badge>
                              <span className="text-sm">{member.profiles?.email}</span>
                            </div>
                            {member.role !== 'owner' && isAdmin && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={async () => {
                                  const newRole = member.role === 'admin' ? 'member' : 'admin';
                                  await supabase
                                    .from('team_members')
                                    .update({ role: newRole })
                                    .eq('id', member.id);
                                }}
                              >
                                {member.role === 'admin' ? 'Zum Mitglied machen' : 'Zum Admin machen'}
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>
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
            Zurück zur Übersicht
          </Button>
        </div>
        <Separator className="my-4" />
      </div>
    </div>
  );
}