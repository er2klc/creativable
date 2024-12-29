import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "@supabase/auth-helpers-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Infinity, Users, UserPlus, Crown, Image as ImageIcon, Copy, Plus } from "lucide-react";
import type { Team } from "@/integrations/supabase/types/teams";
import { CreateTeamDialog } from "@/components/teams/CreateTeamDialog";
import { JoinTeamDialog } from "@/components/teams/JoinTeamDialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { toast } from "sonner";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

const Unity = () => {
  const navigate = useNavigate();
  const user = useUser();
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);

  const { data: teams, isLoading, refetch } = useQuery({
    queryKey: ['teams'],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase.rpc('get_user_teams', { uid: user.id });

      if (error) {
        console.error("Error loading teams:", error);
        toast.error("Fehler beim Laden der Teams");
        return [];
      }

      return data || [];
    },
    enabled: !!user,
  });

  const { data: teamStats } = useQuery({
    queryKey: ['team-stats', selectedTeam?.id],
    queryFn: async () => {
      if (!selectedTeam?.id) return null;
      
      const { data: members } = await supabase
        .from('team_members')
        .select('role')
        .eq('team_id', selectedTeam.id);

      return {
        totalMembers: members?.length || 0,
        admins: members?.filter(m => ['admin', 'owner'].includes(m.role)).length || 0,
      };
    },
    enabled: !!selectedTeam?.id,
  });

  useEffect(() => {
    if (!user) {
      navigate("/auth");
    }
  }, [user, navigate]);

  const copyJoinCode = async (joinCode: string) => {
    await navigator.clipboard.writeText(joinCode);
    toast.success("Beitritts-Code kopiert!");
  };

  if (!user) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Infinity className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-['Orbitron'] text-primary">Unity</h1>
        </div>
        <div className="flex gap-2">
          <JoinTeamDialog onTeamJoined={refetch} />
          <CreateTeamDialog onTeamCreated={refetch} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
              </div>
            </CardContent>
          </Card>
        ) : teams?.length === 0 ? (
          <Card className="col-span-full">
            <CardContent className="p-6">
              <div className="flex flex-col items-center justify-center space-y-4 py-12">
                <Users className="h-12 w-12 text-muted-foreground" />
                <div className="text-center space-y-2">
                  <h3 className="font-semibold">Keine Teams gefunden</h3>
                  <p className="text-sm text-muted-foreground max-w-sm">
                    Erstellen Sie ein neues Team oder treten Sie einem bestehenden Team bei.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          teams?.map((team: Team) => (
            <Sheet key={team.id}>
              <SheetTrigger asChild>
                <Card className="cursor-pointer hover:shadow-lg transition-all duration-300 group">
                  <CardHeader className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-12 w-12">
                          {team.logo_url ? (
                            <AvatarImage src={team.logo_url} alt={team.name} />
                          ) : (
                            <AvatarFallback className="bg-primary/10">
                              {team.name.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          )}
                        </Avatar>
                        <div>
                          <CardTitle className="group-hover:text-primary transition-colors">
                            {team.name}
                          </CardTitle>
                          <CardDescription>
                            {team.description || 'Keine Beschreibung verfügbar'}
                          </CardDescription>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      {team.join_code && (
                        <div className="flex items-center gap-2 p-2 bg-muted rounded-lg flex-1">
                          <code className="text-sm flex-1">Code: {team.join_code}</code>
                          <Button 
                            size="icon" 
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              copyJoinCode(team.join_code!);
                            }}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {teamStats?.totalMembers || 0} Mitglieder
                      </Badge>
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <Crown className="h-3 w-3" />
                        {teamStats?.admins || 0} Admins
                      </Badge>
                      {team.created_by === user.id && (
                        <Badge variant="default" className="flex items-center gap-1">
                          <Crown className="h-3 w-3" />
                          Team Owner
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                </Card>
              </SheetTrigger>
              <SheetContent side="right" className="w-full sm:w-[540px]">
                <SheetHeader>
                  <SheetTitle>Team Details</SheetTitle>
                </SheetHeader>
                {/* Team management content will go here in the next iteration */}
                <div className="mt-6">
                  <p>Team Management Funktionen werden hier implementiert...</p>
                </div>
              </SheetContent>
            </Sheet>
          ))
        )}
      </div>
    </div>
  );
};

export default Unity;