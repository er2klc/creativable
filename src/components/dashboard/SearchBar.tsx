import { Search } from "lucide-react";

export const SearchBar = () => {
  return (
    <div className="relative mb-8">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/50" />
      <input
        type="text"
        placeholder="Lead suchen..."
        className="w-full pl-10 pr-4 py-2 bg-[#1A1F2C]/60 border border-white/10 rounded-lg text-white placeholder-white/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50"
      />
    </div>
  );
};