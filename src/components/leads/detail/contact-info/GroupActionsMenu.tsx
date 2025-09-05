import { Plus, GripVertical, Eye, EyeOff, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
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
          className="h-8 w-8 p-0 hover:bg-gray-100 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <MoreVertical className="h-4 w-4 text-gray-500" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className="w-48 bg-white border rounded-md shadow-md z-50"
      >
        <DropdownMenuItem 
          onClick={onAddField}
          className="flex items-center px-3 py-2 text-sm cursor-pointer hover:bg-gray-100"
        >
          <Plus className="mr-2 h-4 w-4" />
          {settings?.language === "en" ? "Add Field" : "Feld hinzufügen"}
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={onToggleReordering}
          className="flex items-center px-3 py-2 text-sm cursor-pointer hover:bg-gray-100"
        >
          <GripVertical className="mr-2 h-4 w-4" />
          {isReordering 
            ? (settings?.language === "en" ? "Done" : "Fertig")
            : (settings?.language === "en" ? "Reorder" : "Neu anordnen")
          }
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={onToggleEmpty}
          className="flex items-center px-3 py-2 text-sm cursor-pointer hover:bg-gray-100"
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
    </DropdownMenu>
  );
}