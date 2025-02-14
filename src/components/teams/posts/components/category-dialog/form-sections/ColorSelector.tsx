
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { availableColors } from "../constants";
import { cn } from "@/lib/utils";
import { useEffect } from "react";

interface ColorSelectorProps {
  selectedColor: string;
  onColorChange: (value: string) => void;
}

export const ColorSelector = ({
  selectedColor,
  onColorChange,
}: ColorSelectorProps) => {
  // Find the color option that matches the selected color
  const currentColor = availableColors.find(color => color.value === selectedColor);

  // Debug logging to track color selection issues
  useEffect(() => {
    if (!currentColor) {
      console.warn('Selected color not found in availableColors:', selectedColor);
      console.log('Available colors:', availableColors.map(c => c.value));
    }
  }, [selectedColor, currentColor]);

  const handleColorChange = (value: string) => {
    console.log('Color changed to:', value);
    onColorChange(value);
  };

  return (
    <div className="grid gap-2">
      <Label>Hintergrundfarbe für die Kategorie</Label>
      <Select
        value={selectedColor}
        onValueChange={handleColorChange}
      >
        <SelectTrigger className="w-full">
          <SelectValue>
            {currentColor ? (
              <div className="flex items-center gap-2">
                <div className={cn("w-4 h-4 rounded", currentColor.value.split(' ')[0])} />
                <span>{currentColor.name}</span>
              </div>
            ) : (
              <span className="text-muted-foreground">Farbe auswählen</span>
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {availableColors.map((color) => (
            <SelectItem 
              key={color.value} 
              value={color.value}
              className="flex items-center gap-2"
            >
              <div className="flex items-center gap-2">
                <div className={cn("w-4 h-4 rounded", color.value.split(' ')[0])} />
                <span>{color.name}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
