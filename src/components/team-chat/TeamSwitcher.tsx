
import { Check, ChevronDown } from "lucide-react";
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
      <SelectTrigger className="w-[200px] justify-between" disabled>
        <span>Fehler beim Laden</span>
      </SelectTrigger>
    );
  }

  return (
    <Select 
      value={selectedTeamId || ''} 
      onValueChange={(value) => setSelectedTeamId(value)}
      disabled={isLoading}
    >
      <SelectTrigger className="w-[200px]">
        <SelectValue>
          {isLoading ? (
            <span>Lädt Teams...</span>
          ) : (
            <div className="flex items-center gap-2">
              {selectedTeam && (
                <Avatar className="h-5 w-5">
                  <AvatarImage src={selectedTeam.logo_url || ""} />
                  <AvatarFallback>
                    {selectedTeam.name.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              )}
              <span>{selectedTeam?.name || "Team wählen"}</span>
            </div>
          )}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {teams.map((team) => {
          const unreadCount = unreadMessagesByTeam[team.id]?.totalCount || 0;
          
          return (
            <SelectItem
              key={team.id}
              value={team.id}
              className="flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <Avatar className="h-5 w-5">
                  <AvatarImage src={team.logo_url || ""} />
                  <AvatarFallback>
                    {team.name.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span>{team.name}</span>
              </div>
              {unreadCount > 0 && (
                <Badge 
                  variant="secondary" 
                  className="ml-2"
                >
                  {unreadCount}
                </Badge>
              )}
              {selectedTeamId === team.id && (
                <Check
                  className={cn(
                    "ml-auto h-4 w-4",
                    selectedTeamId === team.id ? "opacity-100" : "opacity-0"
                  )}
                />
              )}
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
}
