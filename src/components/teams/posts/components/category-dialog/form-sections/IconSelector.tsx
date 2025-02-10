
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { availableIcons } from "../constants";

interface IconSelectorProps {
  selectedIcon: string;
  onIconChange: (value: string) => void;
}

export const IconSelector = ({
  selectedIcon,
  onIconChange,
}: IconSelectorProps) => {
  const SelectedIconComponent = availableIcons.find(i => i.name === selectedIcon)?.icon || availableIcons[0].icon;

  return (
    <div className="grid gap-2">
      <Select
        value={selectedIcon}
        onValueChange={onIconChange}
      >
        <SelectTrigger>
          <SelectValue>
            <div className="flex items-center gap-2">
              <SelectedIconComponent className="h-4 w-4" />
              <span>{selectedIcon}</span>
            </div>
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {availableIcons.map(({ name, icon: Icon }) => (
            <SelectItem key={name} value={name}>
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
