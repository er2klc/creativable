import { Plus, GripVertical, Eye, EyeOff, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuPortal,
} from "@/components/ui/dropdown-menu";
import { useSettings } from "@/hooks/use-settings";

interface GroupActionsMenuProps {
  showEmpty: boolean;
  isReordering: boolean;
  onToggleEmpty: () => void;
  onToggleReordering: () => void;
  onAddField: () => void;
}

export function GroupActionsMenu({
  showEmpty,
  isReordering,
  onToggleEmpty,
  onToggleReordering,
  onAddField,
}: GroupActionsMenuProps) {
  const { settings } = useSettings();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="p-1 hover:bg-gray-100 rounded-full"
        >
          <MoreVertical className="h-4 w-4 text-gray-500" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuPortal>
        <DropdownMenuContent 
          align="end" 
          className="z-50 bg-white dark:bg-gray-800 shadow-lg rounded-md border w-48"
        >
          <DropdownMenuItem 
            onClick={onAddField}
            className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <Plus className="mr-2 h-4 w-4" />
            {settings?.language === "en" ? "Add Field" : "Feld hinzufügen"}
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={onToggleReordering}
            className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <GripVertical className="mr-2 h-4 w-4" />
            {isReordering 
              ? (settings?.language === "en" ? "Done" : "Fertig")
              : (settings?.language === "en" ? "Reorder" : "Neu anordnen")
            }
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={onToggleEmpty}
            className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            {showEmpty ? (
              <>
                <EyeOff className="mr-2 h-4 w-4" />
                {settings?.language === "en" ? "Hide Empty" : "Leere ausblenden"}
              </>
            ) : (
              <>
                <Eye className="mr-2 h-4 w-4" />
                {settings?.language === "en" ? "Show Empty" : "Leere anzeigen"}
              </>
            )}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenuPortal>
    </DropdownMenu>
  );
}