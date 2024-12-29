import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "@supabase/auth-helpers-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Infinity, Users } from "lucide-react";
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
        // First get teams where user is creator
        const { data: ownedTeams, error: ownedError } = await supabase
          .from('teams')
          .select('*')
          .eq('created_by', user.id);

        if (ownedError) {
          console.error("Error fetching owned teams:", ownedError);
          throw ownedError;
        }

        // Then get teams where user is a member
        const { data: memberTeams, error: memberError } = await supabase
          .from('teams')
          .select('*')
          .neq('created_by', user.id)
          .in('id', 
            supabase
              .from('team_members')
              .select('team_id')
              .eq('user_id', user.id)
          );

        if (memberError) {
          console.error("Error fetching member teams:", memberError);
          throw memberError;
        }

        // Combine and remove duplicates
        const allTeams = [...(ownedTeams || []), ...(memberTeams || [])];
        const uniqueTeams = Array.from(new Map(allTeams.map(team => [team.id, team])).values());
        
        return uniqueTeams;
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <Card>
            <CardContent className="p-6">
              <div className="animate-pulse space-y-4">
                <div className="h-4 bg-muted rounded w-3/4" />
                <div className="h-4 bg-muted rounded w-1/2" />
              </div>
            </CardContent>
          </Card>
        ) : teams?.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center space-y-4">
              <Users className="h-12 w-12 mx-auto text-muted-foreground" />
              <div className="space-y-2">
                <h3 className="font-semibold">Keine Teams gefunden</h3>
                <p className="text-sm text-muted-foreground">
                  Erstellen Sie ein neues Team oder warten Sie auf eine Einladung.
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          teams?.map((team) => (
            <Card key={team.id} className="hover:shadow-md transition-shadow">
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