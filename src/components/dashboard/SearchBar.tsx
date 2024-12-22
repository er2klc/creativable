import { Search } from "lucide-react";

export const SearchBar = () => {
  return (
    <div className="relative mb-8">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <input
        type="text"
        placeholder="Lead suchen..."
        className="w-full pl-10 pr-4 py-2 border rounded-md bg-background"
      />
    </div>
  );
};