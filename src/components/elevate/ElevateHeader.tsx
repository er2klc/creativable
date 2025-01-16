import { GraduationCap } from "lucide-react";
import { CreatePlatformDialog } from "./CreatePlatformDialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useUser } from "@supabase/auth-helpers-react";

interface ElevateHeaderProps {
  onPlatformCreated: () => Promise<void>;
  selectedTeam: string | null;
  onTeamChange: (teamId: string | null) => void;
}

export const ElevateHeader = ({ 
  onPlatformCreated, 
  selectedTeam, 
  onTeamChange 
}: ElevateHeaderProps) => {
  const user = useUser();

  const { data: teams } = useQuery({
    queryKey: ['user-teams', user?.id],
    queryFn: async () => {
      const { data: teamMembers, error } = await supabase
        .from('team_members')
        .select(`
          team_id,
          teams (
            id,
            name,
            order_index
          )
        `)
        .eq('user_id', user?.id)
        .order('order_index', { foreignTable: 'teams', ascending: true });

      if (error) throw error;
      return teamMembers?.map(tm => tm.teams) || [];
    },
    enabled: !!user?.id
  });

  return (
    <div className="flex items-center justify-between mb-8">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <GraduationCap className="h-6 w-6" />
          Elevate
        </h1>
        <p className="text-muted-foreground">
          Ausbildungsplattform
        </p>
      </div>
      <div className="flex items-center gap-4">
        <Select
          value={selectedTeam || "all"}
          onValueChange={(value) => onTeamChange(value === "all" ? null : value)}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Team auswählen" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle Teams</SelectItem>
            {teams?.map((team) => (
              <SelectItem key={team.id} value={team.id}>
                {team.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button variant="outline">
          Modul beitreten
        </Button>
        <CreatePlatformDialog onPlatformCreated={onPlatformCreated} />
      </div>
    </div>
  );
};