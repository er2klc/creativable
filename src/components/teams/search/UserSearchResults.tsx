import { Command, CommandEmpty, CommandGroup, CommandItem } from "@/components/ui/command";
import { Search } from "lucide-react";

interface SearchResult {
  id: string;
  email: string;
}

interface UserSearchResultsProps {
  searchResults: SearchResult[];
  onSelectUser: (email: string) => void;
}

export const UserSearchResults = ({ searchResults, onSelectUser }: UserSearchResultsProps) => {
  return (
    <Command className="rounded-lg border shadow-md">
      <CommandEmpty>Keine Benutzer gefunden.</CommandEmpty>
      {searchResults.length > 0 && (
        <CommandGroup>
          {searchResults.map((result) => (
            <CommandItem
              key={result.id}
              onSelect={() => onSelectUser(result.email)}
            >
              <Search className="mr-2 h-4 w-4" />
              {result.email}
            </CommandItem>
          ))}
        </CommandGroup>
      )}
    </Command>
  );
};