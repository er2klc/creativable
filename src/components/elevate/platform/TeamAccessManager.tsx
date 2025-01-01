import { useQuery } from "@tanstack/react-query";
import { useUser } from "@supabase/auth-helpers-react";
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
  setSelectedTeams
}: TeamAccessManagerProps) => {
  const user = useUser();

  const { data: teams = [] } = useQuery({
    queryKey: ['user-teams'],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .rpc('get_user_teams', { uid: user.id });

      if (error) {
        console.error("Error loading teams:", error);
        return [];
      }

      return data;
    },
    enabled: !!user,
  });

  const handleTeamToggle = (teamId: string) => {
    const newSelectedTeams = selectedTeams.includes(teamId)
      ? selectedTeams.filter(id => id !== teamId)
      : [...selectedTeams, teamId];
    
    setSelectedTeams(newSelectedTeams);
  };

  return (
    <div className="space-y-4">
      <div>
        <Label>Teams mit Zugriff</Label>
        <p className="text-sm text-muted-foreground">
          Wählen Sie die Teams aus, die Zugriff auf diese Plattform haben sollen
        </p>
      </div>
      <ScrollArea className="h-[200px] border rounded-md p-4">
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