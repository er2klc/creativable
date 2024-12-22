import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Filter } from "lucide-react";

interface LeadFiltersProps {
  selectedPhase: string | null;
  setSelectedPhase: (phase: string | null) => void;
  selectedPlatform: string | null;
  setSelectedPlatform: (platform: string | null) => void;
}

export const LeadFilters = ({
  selectedPhase,
  setSelectedPhase,
  selectedPlatform,
  setSelectedPlatform,
}: LeadFiltersProps) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">
          <Filter className="h-4 w-4 mr-2" />
          Filter
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[200px]">
        <DropdownMenuItem onClick={() => setSelectedPhase(null)}>
          Alle Phasen
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setSelectedPhase("initial_contact")}>
          Erstkontakt
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setSelectedPhase("follow_up")}>
          Follow-up
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setSelectedPhase("closed")}>
          Abschluss
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};