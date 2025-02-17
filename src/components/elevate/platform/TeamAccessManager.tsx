import { useUser } from "@supabase/auth-helpers-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";

interface TeamAccessManagerProps {
  selectedTeams: string[];
  setSelectedTeams: (teams: string[]) => void;
}

export const TeamAccessManager = ({
  selectedTeams,
  setSelectedTeams,
}: TeamAccessManagerProps) => {
  const user = useUser();

  const { data: teams = [] } = useQuery({
    queryKey: ['user-owned-teams'],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from('team_members')
        .select('team_id, teams:team_id(id, name)')
        .eq('user_id', user.id)
        .eq('role', 'owner');

      if (error) {
        console.error("Error loading teams:", error);
        return [];
      }

      return data.map(member => member.teams);
    },
    enabled: !!user,
  });

  const handleTeamToggle = (teamId: string) => {
    setSelectedTeams(
      selectedTeams.includes(teamId)
        ? selectedTeams.filter(id => id !== teamId)
        : [...selectedTeams, teamId]
    );
  };

  if (teams.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div>
        <Label>Teams mit Zugriff</Label>
        <p className="text-sm text-muted-foreground">
          Wählen Sie die Teams aus, die Zugriff auf dieses Modul haben sollen
        </p>
      </div>
      <ScrollArea className="h-[200px] w-full rounded-md border p-4">
        <div className="space-y-4">
          {teams.map((team) => (
            <div key={team.id} className="flex items-center space-x-2">
              <Checkbox
                id={team.id}
                checked={selectedTeams.includes(team.id)}
                onCheckedChange={() => handleTeamToggle(team.id)}
              />
              <label
                htmlFor={team.id}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {team.name}
              </label>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};