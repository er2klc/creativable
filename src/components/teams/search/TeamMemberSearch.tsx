
import { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface TeamMemberSearchProps {
  onSearch: (query: string) => void;
  placeholder?: string;
}

export const TeamMemberSearch = ({ onSearch, placeholder = "Mitglieder suchen..." }: TeamMemberSearchProps) => {
  const [query, setQuery] = useState("");

  const handleChange = (value: string) => {
    setQuery(value);
    if (value.length >= 2) {
      onSearch(value);
    }
  };

  return (
    <div className="relative">
      <Label htmlFor="team-member-search" className="sr-only">
        Mitglieder suchen
      </Label>
      <div className="relative">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          id="team-member-search"
          placeholder={placeholder}
          value={query}
          onChange={(e) => handleChange(e.target.value)}
          className="pl-8 bg-white"
        />
      </div>
    </div>
  );
};
