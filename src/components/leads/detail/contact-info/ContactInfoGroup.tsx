import React, { useState } from "react";
import { ChevronDown, ChevronUp, Eye, EyeOff, GripVertical, MoreVertical, Plus, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useContactFields } from "@/hooks/use-contact-fields";
import { toast } from "sonner";
import { useSettings } from "@/hooks/use-settings";

interface ContactInfoGroupProps {
  title: string;
  leadId: string;
  children: React.ReactNode;
  showEmptyFields?: boolean;
  onToggleEmptyFields?: () => void;
  groupName: string;
}

export function ContactInfoGroup({
  title,
  leadId,
  children,
  showEmptyFields = true,
  onToggleEmptyFields,
  groupName,
}: ContactInfoGroupProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showEmpty, setShowEmpty] = useState(showEmptyFields);
  const [isReordering, setIsReordering] = useState(false);
  const [isAddingField, setIsAddingField] = useState(false);
  const [newFieldLabel, setNewFieldLabel] = useState("");
  const [showActions, setShowActions] = useState(false);
  const { addField } = useContactFields();
  const { settings } = useSettings();

  const handleToggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  const handleToggleEmpty = () => {
    setShowEmpty(!showEmpty);
    if (onToggleEmptyFields) {
      onToggleEmptyFields();
    }
  };

  const handleToggleReordering = () => {
    setIsReordering(!isReordering);
  };

  const handleAddField = () => {
    setIsAddingField(true);
  };

  const handleSaveNewField = async () => {
    if (newFieldLabel.trim()) {
      try {
        await addField({
          field_name: newFieldLabel,
          field_group: groupName,
          field_type: 'text'
        });
        setIsAddingField(false);
        setNewFieldLabel("");
        toast.success(
          settings?.language === "en"
            ? "Field added successfully"
            : "Feld erfolgreich hinzugefügt"
        );
      } catch (error) {
        console.error("Error saving new field:", error);
        toast.error(
          settings?.language === "en"
            ? "Error saving field"
            : "Fehler beim Speichern des Feldes"
        );
      }
    }
  };

  return (
    <div className="space-y-2">
      <div 
        className="flex items-center justify-between group"
        onMouseEnter={() => setShowActions(true)}
        onMouseLeave={() => setShowActions(false)}
      >
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleToggleCollapse}
            className="p-0 hover:bg-transparent"
          >
            {isCollapsed ? (
              <ChevronDown className="h-4 w-4 text-gray-500" />
            ) : (
              <ChevronUp className="h-4 w-4 text-gray-500" />
            )}
          </Button>
          <h3 className="text-sm font-medium text-gray-600">{title}</h3>
        </div>
        
        {showActions && (
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
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleAddField}>
                <Plus className="mr-2 h-4 w-4" />
                {settings?.language === "en" ? "Add Field" : "Feld hinzufügen"}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleToggleReordering}>
                <GripVertical className="mr-2 h-4 w-4" />
                {isReordering 
                  ? (settings?.language === "en" ? "Done" : "Fertig")
                  : (settings?.language === "en" ? "Reorder" : "Neu anordnen")
                }
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleToggleEmpty}>
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
        )}
      </div>

      {!isCollapsed && (
        <div className="space-y-1">
          {isAddingField && (
            <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3 w-full">
                <Settings className="h-4 w-4 text-gray-500 shrink-0" />
                <Input
                  value={newFieldLabel}
                  onChange={(e) => setNewFieldLabel(e.target.value)}
                  onBlur={handleSaveNewField}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleSaveNewField();
                    }
                  }}
                  placeholder={settings?.language === "en" ? "Field name" : "Feldname"}
                  className="h-8 text-sm bg-white"
                  autoFocus
                />
              </div>
            </div>
          )}
          {React.Children.map(children, child => {
            if (React.isValidElement(child)) {
              return React.cloneElement(child, {
                ...child.props,
                isVisible: showEmpty,
                isReordering: isReordering
              });
            }
            return child;
          })}
        </div>
      )}
    </div>
  );
}