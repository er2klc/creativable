import { useState } from "react";
import { useContactFields } from "@/hooks/use-contact-fields";
import { Button } from "@/components/ui/button";
import { Plus, Settings, Eye, EyeOff, GripVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuPortal,
} from "@/components/ui/dropdown-menu";
import { useSettings } from "@/hooks/use-settings";
import { toast } from "sonner";

export function ContactFieldManager() {
  const [isReordering, setIsReordering] = useState(false);
  const [showEmpty, setShowEmpty] = useState(true);
  const { settings } = useSettings();
  const { fields, addField } = useContactFields();

  console.log("ContactFieldManager rendering with fields:", fields);

  const handleAddField = async () => {
    console.log("Adding new field...");
    try {
      await addField({
        field_name: settings?.language === "en" ? "New Field" : "Neues Feld",
        field_group: "basic_info",
        field_type: "text"
      });
      console.log("Field added successfully");
      toast.success(
        settings?.language === "en" 
          ? "Field added successfully" 
          : "Feld erfolgreich hinzugefügt"
      );
    } catch (error) {
      console.error("Error adding field:", error);
      toast.error(
        settings?.language === "en"
          ? "Error adding field"
          : "Fehler beim Hinzufügen des Feldes"
      );
    }
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
          <Button 
            variant="ghost" 
            size="sm"
            className="hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <Settings className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuPortal>
          <DropdownMenuContent 
            align="end" 
            className="z-50 bg-white dark:bg-gray-800 shadow-lg rounded-md border"
          >
            <DropdownMenuItem 
              onClick={handleAddField}
              className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <Plus className="mr-2 h-4 w-4" />
              {settings?.language === "en" ? "Add Field" : "Feld hinzufügen"}
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={handleToggleEmpty}
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
            <DropdownMenuItem 
              onClick={handleToggleReordering}
              className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <GripVertical className="mr-2 h-4 w-4" />
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
        </DropdownMenuPortal>
      </DropdownMenu>
    </div>
  );
}