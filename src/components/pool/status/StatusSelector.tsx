
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface StatusOption {
  id: string;
  label: string;
  count: number;
}

interface StatusSelectorProps {
  status: string;
  statusOptions: StatusOption[];
}

export const StatusSelector = ({ status, statusOptions }: StatusSelectorProps) => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <Select value={status} onValueChange={(value) => navigate(`/pool/${value}`)}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Status auswählen" />
        </SelectTrigger>
        <SelectContent>
          {statusOptions.map((option) => (
            <SelectItem key={option.id} value={option.id}>
              {option.label} ({option.count})
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }

  return (
    <Tabs defaultValue={status} className="w-full" onValueChange={(value) => navigate(`/pool/${value}`)}>
      <TabsList className="flex h-auto w-full bg-transparent gap-2 justify-start">
        {statusOptions.map((option) => (
          <TabsTrigger 
            key={option.id}
            value={option.id}
            className={cn(
              "data-[state=active]:bg-accent data-[state=active]:text-accent-foreground",
              "border border-input hover:bg-accent/50",
              "h-8 px-3 text-sm"
            )}
          >
            {option.label} ({option.count})
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
};
