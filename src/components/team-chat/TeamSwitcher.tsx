
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useTeamChatStore } from "@/store/useTeamChatStore";

export function TeamSwitcher() {
  const [open, setOpen] = useState(false);
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
      return data || []; // Ensure we always return an array
    },
    // Initialize selectedTeamId with first team if none selected
    onSuccess: (data) => {
      if (data.length > 0 && !selectedTeamId) {
        setSelectedTeamId(data[0].id);
      }
    }
  });

  const selectedTeam = teams.find((team) => team.id === selectedTeamId);

  if (error) {
    console.error('Error loading teams:', error);
    return (
      <Button variant="outline" className="w-[200px] justify-between" disabled>
        Fehler beim Laden
      </Button>
    );
  }

  const renderTeamList = () => {
    if (isLoading) return <CommandEmpty>Lädt Teams...</CommandEmpty>;
    if (teams.length === 0) return <CommandEmpty>Keine Teams gefunden.</CommandEmpty>;

    return (
      <CommandGroup>
        {teams.map((team) => {
          const unreadCount = unreadMessagesByTeam[team.id]?.totalCount || 0;
          
          return (
            <CommandItem
              key={team.id}
              value={team.name}
              onSelect={() => {
                setSelectedTeamId(team.id);
                setOpen(false);
              }}
            >
              <div className="flex items-center gap-2 flex-1">
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
              <Check
                className={cn(
                  "ml-auto h-4 w-4",
                  selectedTeamId === team.id ? "opacity-100" : "opacity-0"
                )}
              />
            </CommandItem>
          );
        })}
      </CommandGroup>
    );
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[200px] justify-between"
          disabled={isLoading}
        >
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
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder="Team suchen..." />
          {renderTeamList()}
        </Command>
      </PopoverContent>
    </Popover>
  );
}
