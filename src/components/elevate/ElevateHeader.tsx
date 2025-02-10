
import { GraduationCap } from "lucide-react";
import { CreatePlatformDialog } from "./CreatePlatformDialog";
import { JoinPlatformDialog } from "./JoinPlatformDialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useUser } from "@supabase/auth-helpers-react";
import { SearchBar } from "@/components/dashboard/SearchBar";
import { HeaderActions } from "@/components/layout/HeaderActions";

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
    <div className="fixed top-0 left-0 right-0 z-[40] bg-white border-b border-sidebar-border md:left-[72px] md:group-hover:left-[240px] transition-[left] duration-300">
      <div className="w-full">
        <div className="h-16 px-4 flex items-center">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 w-full">
            <div className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5" />
              <div className="flex items-center gap-2">
                <h1 className="text-lg md:text-xl font-semibold text-foreground">
                  Elevate
                </h1>
                <span className="text-sm text-muted-foreground">
                  Ausbildungsplattform
                </span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-[300px]">
                <SearchBar />
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
                <JoinPlatformDialog onPlatformJoined={onPlatformCreated} />
                <CreatePlatformDialog onPlatformCreated={onPlatformCreated} />
              </div>
            </div>
            <HeaderActions profile={null} userEmail={user?.email} />
          </div>
        </div>
      </div>
    </div>
  );
};
