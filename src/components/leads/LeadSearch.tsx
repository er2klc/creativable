import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface LeadSearchProps {
  value: string;
  onChange: (value: string) => void;
}

export const LeadSearch = ({ value, onChange }: LeadSearchProps) => {
  return (
    <div className="relative flex-1">
      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
      <Input
        placeholder="Suchen..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pl-8"
      />
    </div>
  );
};