
import { Button } from "@/components/ui/button";
import { ChevronDown, Instagram, Linkedin } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface AddLeadButtonsProps {
  onAddLeadClick: () => void;
  onInstagramClick: () => void;
  onLinkedInClick: () => void;
}

export const AddLeadButtons = ({
  onAddLeadClick,
  onInstagramClick,
  onLinkedInClick,
}: AddLeadButtonsProps) => {
  return (
    <div className="flex items-center gap-0">
      <Button
        variant="default"
        className="bg-black text-white hover:bg-black/90 rounded-r-none text-sm whitespace-nowrap"
        onClick={onAddLeadClick}
      >
        ✨ Kontakt hinzufügen
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="default"
            size="icon"
            className="bg-black text-white hover:bg-black/90 rounded-l-none"
          >
            <ChevronDown className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={onInstagramClick}>
            <Instagram className="h-4 w-4 mr-2" />
            <span>Instagram</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onLinkedInClick}>
            <Linkedin className="h-4 w-4 mr-2" />
            <span>LinkedIn</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
