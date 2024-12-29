import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "@supabase/auth-helpers-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Infinity, Users, LoaderCircle } from "lucide-react";
import type { Team } from "@/integrations/supabase/types/teams";
import { InviteTeamMemberDialog } from "@/components/teams/InviteTeamMemberDialog";
import { CreateTeamDialog } from "@/components/teams/CreateTeamDialog";
import { toast } from "sonner";

const Unity = () => {
  const navigate = useNavigate();
  const user = useUser();

  const { data: teams, isLoading, refetch } = useQuery({
    queryKey: ['teams'],
    queryFn: async () => {
      if (!user?.id) return [];
      
      try {
        // Get teams where user is creator
        const { data: ownedTeams, error: ownedError } = await supabase
          .from('teams')
          .select('*')
          .eq('created_by', user.id);

        if (ownedError) throw ownedError;

        // Get teams where user is a member
        const { data: memberTeams, error: memberError } = await supabase
          .from('team_members')
          .select('team_id')
          .eq('user_id', user.id);

        if (memberError) throw memberError;

        // If user is a member of any teams, get those team details
        let memberTeamDetails = [];
        if (memberTeams.length > 0) {
          const { data: teamDetails, error: teamDetailsError } = await supabase
            .from('teams')
            .select('*')
            .in('id', memberTeams.map(tm => tm.team_id));

          if (teamDetailsError) throw teamDetailsError;
          memberTeamDetails = teamDetails || [];
        }

        // Combine and remove duplicates
        const allTeams = [...(ownedTeams || []), ...memberTeamDetails];
        return Array.from(new Map(allTeams.map(team => [team.id, team])).values());

      } catch (error: any) {
        console.error("Error loading teams:", error);
        toast.error("Fehler beim Laden der Teams");
        return [];
      }
    },
    enabled: !!user,
  });

  useEffect(() => {
    if (!user) {
      navigate("/auth");
    }
  }, [user, navigate]);

  if (!user) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Infinity className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-['Orbitron'] text-primary">Unity</h1>
        </div>
        <CreateTeamDialog onTeamCreated={refetch} />
      </div>

      <div className="space-y-4">
        {isLoading ? (
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-center py-8">
                <LoaderCircle className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        ) : teams?.length === 0 ? (
          <Card className="w-full">
            <CardContent className="p-6">
              <div className="flex flex-col items-center justify-center space-y-4 py-12">
                <Users className="h-12 w-12 text-muted-foreground" />
                <div className="text-center space-y-2">
                  <h3 className="font-semibold">Keine Teams gefunden</h3>
                  <p className="text-sm text-muted-foreground max-w-sm">
                    Erstellen Sie ein neues Team oder warten Sie auf eine Einladung.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          teams?.map((team) => (
            <Card key={team.id} className="w-full hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle>{team.name}</CardTitle>
                <CardDescription>
                  {team.description || 'Keine Beschreibung verfügbar'}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex justify-end">
                <InviteTeamMemberDialog 
                  teamId={team.id} 
                  onInviteSent={refetch}
                />
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default Unity;