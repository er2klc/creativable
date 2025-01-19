import { useState } from "react";
import { useContactFields } from "@/hooks/use-contact-fields";
import { Button } from "@/components/ui/button";
import { Plus, Settings } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSettings } from "@/hooks/use-settings";

export function ContactFieldManager() {
  const [isReordering, setIsReordering] = useState(false);
  const [showEmpty, setShowEmpty] = useState(true);
  const { settings } = useSettings();
  const { fields, addField } = useContactFields();

  const handleAddField = () => {
    addField({
      field_name: settings?.language === "en" ? "New Field" : "Neues Feld",
      field_group: "basic_info",
      field_type: "text"
    });
  };

  const handleToggleEmpty = () => {
    setShowEmpty(!showEmpty);
  };

  const handleToggleReordering = () => {
    setIsReordering(!isReordering);
  };

  return (
    <div className="flex justify-end">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm">
            <Settings className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={handleAddField}>
            <Plus className="mr-2 h-4 w-4" />
            {settings?.language === "en" ? "Add Field" : "Feld hinzufügen"}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleToggleEmpty}>
            {showEmpty ? (
              <span>
                {settings?.language === "en" ? "Hide Empty" : "Leere ausblenden"}
              </span>
            ) : (
              <span>
                {settings?.language === "en" ? "Show Empty" : "Leere anzeigen"}
              </span>
            )}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleToggleReordering}>
            {isReordering ? (
              <span>
                {settings?.language === "en" ? "Done Reordering" : "Neu anordnen beenden"}
              </span>
            ) : (
              <span>
                {settings?.language === "en" ? "Reorder Fields" : "Felder neu anordnen"}
              </span>
            )}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}