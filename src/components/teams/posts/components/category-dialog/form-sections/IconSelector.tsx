
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { availableIcons } from "../constants";
import { useEffect } from "react";

interface IconSelectorProps {
  selectedIcon: string;
  onIconChange: (value: string) => void;
}

export const IconSelector = ({
  selectedIcon,
  onIconChange,
}: IconSelectorProps) => {
  const SelectedIconComponent = availableIcons.find(i => i.name === selectedIcon)?.icon;

  // Debug logging for icon selection issues
  useEffect(() => {
    if (!SelectedIconComponent) {
      console.warn('Selected icon not found:', selectedIcon);
      console.log('Available icons:', availableIcons.map(i => i.name));
    }
  }, [selectedIcon, SelectedIconComponent]);

  const handleIconChange = (value: string) => {
    console.log('Icon changed to:', value);
    onIconChange(value);
  };

  return (
    <div className="grid gap-2">
      <Label>Icon für die Kategorie</Label>
      <Select
        value={selectedIcon}
        onValueChange={handleIconChange}
      >
        <SelectTrigger className="w-full">
          <SelectValue>
            {SelectedIconComponent ? (
              <div className="flex items-center gap-2">
                <SelectedIconComponent className="h-4 w-4" />
                <span>{selectedIcon}</span>
              </div>
            ) : (
              <span className="text-muted-foreground">Icon auswählen</span>
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {availableIcons.map(({ name, icon: Icon }) => (
            <SelectItem 
              key={name} 
              value={name}
              className="flex items-center gap-2"
            >
              <div className="flex items-center gap-2">
                <Icon className="h-4 w-4" />
                <span>{name}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
