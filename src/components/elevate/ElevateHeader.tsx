import { useUser } from "@supabase/auth-helpers-react";
import { CreatePlatformDialog } from "./CreatePlatformDialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Users } from "lucide-react";

interface ElevateHeaderProps {
  onPlatformCreated: () => Promise<void>;
  selectedTeam: string | null;
  onTeamChange: (teamId: string | null) => void;
}

export const ElevateHeader = ({ onPlatformCreated, selectedTeam, onTeamChange }: ElevateHeaderProps) => {
  const user = useUser();

  const { data: teams = [] } = useQuery({
    queryKey: ['user-teams'],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data: teamMembers } = await supabase
        .from('team_members')
        .select('team:team_id(id, name)')
        .eq('user_id', user.id);

      return teamMembers?.map(member => member.team) || [];
    },
    enabled: !!user,
  });

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <h1 className="text-2xl font-semibold">Elevate</h1>
        <Select
          value={selectedTeam || "all"}
          onValueChange={(value) => onTeamChange(value === "all" ? null : value)}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Alle Teams" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span>Alle Teams</span>
              </div>
            </SelectItem>
            {teams.map((team: any) => (
              <SelectItem key={team.id} value={team.id}>
                {team.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-center gap-4">
        <CreatePlatformDialog onPlatformCreated={onPlatformCreated} />
      </div>
    </div>
  );
};