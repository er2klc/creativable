
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { availableColors } from "../constants";

interface ColorSelectorProps {
  selectedColor: string;
  onColorChange: (value: string) => void;
}

export const ColorSelector = ({
  selectedColor,
  onColorChange,
}: ColorSelectorProps) => {
  return (
    <div className="grid gap-2">
      <Select
        value={selectedColor}
        onValueChange={onColorChange}
      >
        <SelectTrigger>
          <SelectValue placeholder="Farbe auswählen" />
        </SelectTrigger>
        <SelectContent>
          {availableColors.map((color) => (
            <SelectItem key={color.value} value={color.value}>
              <div className="flex items-center gap-2">
                <div className={`w-4 h-4 rounded ${color.value.split(' ')[0]}`} />
                <span>{color.name}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
