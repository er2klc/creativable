import { useState } from "react";
import { Command, CommandInput } from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { Mail } from "lucide-react";
import { UserSearchResults } from "./UserSearchResults";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface SearchResult {
  id: string;
  email: string;
}

interface UserSearchProps {
  onSelectUser: (email: string) => void;
  onSwitchToEmailInput: () => void;
}

export const UserSearch = ({ onSelectUser, onSwitchToEmailInput }: UserSearchProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);

  const searchUsers = async (query: string) => {
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    try {
      console.log("Searching for:", query);

      const { data, error } = await supabase
        .from('profiles')
        .select('id, email')
        .ilike('email', `%${query}%`)
        .limit(5);

      if (error) {
        console.error("Error searching users:", error);
        throw error;
      }

      setSearchResults(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error searching users:", error);
      setSearchResults([]);
      toast.error("Fehler bei der Benutzersuche");
    }
  };

  return (
    <>
      <Command className="rounded-lg border shadow-md">
        <CommandInput 
          placeholder="Nach Benutzern suchen..." 
          value={searchTerm}
          onValueChange={(value) => {
            setSearchTerm(value);
            searchUsers(value);
          }}
        />
        <UserSearchResults 
          searchResults={searchResults} 
          onSelectUser={onSelectUser} 
        />
      </Command>
      <Button
        variant="outline"
        onClick={onSwitchToEmailInput}
        className="w-full"
      >
        <Mail className="mr-2 h-4 w-4" />
        Per E-Mail einladen
      </Button>
    </>
  );
};
