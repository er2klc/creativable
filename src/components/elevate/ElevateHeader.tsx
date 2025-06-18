
import { CreatePlatformDialog } from "./CreatePlatformDialog";
import { JoinPlatformDialog } from "./JoinPlatformDialog";
import { SearchBar } from "@/components/dashboard/SearchBar";
import { HeaderActions } from "@/components/layout/HeaderActions";
import { useUser } from "@supabase/auth-helpers-react";
import { GraduationCap } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ElevateHeaderProps {
  onPlatformCreated: () => void;
  selectedTeam: string | null;
  onTeamChange: (teamId: string | null) => void;
}

export const ElevateHeader = ({ onPlatformCreated, selectedTeam, onTeamChange }: ElevateHeaderProps) => {
  const user = useUser();

  const { data: teams = [] } = useQuery({
    queryKey: ['user-teams', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase.rpc('get_user_teams', {
        uid: user.id
      });

      if (error) {
        console.error('Error fetching teams:', error);
        return [];
      }

      return data || [];
    },
    enabled: !!user?.id
  });

  return (
    <div className="fixed top-0 left-0 right-0 z-[40] bg-white border-b border-sidebar-border md:left-[72px] md:group-hover:left-[240px] transition-[left] duration-300">
      <div className="w-full">
        <div className="h-16 px-4 flex items-center">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 w-full">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5" />
                <h1 className="text-lg md:text-xl font-semibold text-foreground">
                  Elevate
                </h1>
              </div>
              
              {teams.length > 0 && (
                <Select value={selectedTeam || 'all'} onValueChange={(value) => onTeamChange(value === 'all' ? null : value)}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Team auswählen" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Alle Teams</SelectItem>
                    {teams.map((team: any) => (
                      <SelectItem key={team.id} value={team.id}>
                        {team.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
            
            <div className="hidden md:block w-[300px]">
              <SearchBar />
            </div>
            
            <div className="flex items-center gap-2">
              <CreatePlatformDialog onPlatformCreated={onPlatformCreated} />
              <JoinPlatformDialog />
              <HeaderActions userEmail={user?.email} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
