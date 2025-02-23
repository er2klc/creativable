
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useTeamChatStore } from "@/store/useTeamChatStore";
import { Badge } from "@/components/ui/badge";

export function TeamSwitcher() {
  const selectedTeamId = useTeamChatStore((state) => state.selectedTeamId);
  const setSelectedTeamId = useTeamChatStore((state) => state.setSelectedTeamId);
  const unreadMessagesByTeam = useTeamChatStore((state) => state.unreadMessagesByTeam);

  const { data: teams = [], isLoading, error } = useQuery({
    queryKey: ['user-teams'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('teams')
        .select(`
          id,
          name,
          logo_url,
          slug
        `)
        .order('name');

      if (error) throw error;
      return data || [];
    },
    onSuccess: (data) => {
      if (data.length > 0 && !selectedTeamId) {
        setSelectedTeamId(data[0].id);
      }
    }
  });

  const selectedTeam = teams.find((team) => team.id === selectedTeamId);

  if (error) {
    return (
      <div className="w-[300px]">
        <SelectTrigger disabled>
          <span>Fehler beim Laden</span>
        </SelectTrigger>
      </div>
    );
  }

  return (
    <div className="w-[300px]">
      <Select 
        value={selectedTeamId || ''} 
        onValueChange={(value) => setSelectedTeamId(value)}
        disabled={isLoading}
      >
        <SelectTrigger>
          <SelectValue>
            {isLoading ? (
              <span>Lädt Teams...</span>
            ) : (
              <div className="flex items-center gap-3">
                {selectedTeam && (
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={selectedTeam.logo_url || ""} alt={selectedTeam.name} />
                    <AvatarFallback className="text-xs font-medium">
                      {selectedTeam.name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                )}
                <span className="font-medium truncate">{selectedTeam?.name || "Team wählen"}</span>
              </div>
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {teams.map((team) => {
            const unreadCount = unreadMessagesByTeam[team.id]?.totalCount || 0;
            const isSelected = selectedTeamId === team.id;
            
            return (
              <SelectItem
                key={team.id}
                value={team.id}
                className={cn(
                  "flex items-center justify-between py-3",
                  isSelected && "bg-accent"
                )}
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={team.logo_url || ""} alt={team.name} />
                    <AvatarFallback className="text-xs font-medium">
                      {team.name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="font-medium truncate">{team.name}</span>
                  {unreadCount > 0 && (
                    <Badge variant="secondary" className="ml-auto">
                      {unreadCount}
                    </Badge>
                  )}
                  {isSelected && (
                    <Check className="h-4 w-4 text-primary ml-2" />
                  )}
                </div>
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
    </div>
  );
}
