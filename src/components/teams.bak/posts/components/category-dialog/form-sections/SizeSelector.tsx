
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

export const sizes = [
  { value: 'small', name: 'Klein - kompakte Darstellung' },
  { value: 'medium', name: 'Mittel - standard Darstellung' },
  { value: 'large', name: 'Groß - erweiterte Darstellung' }
] as const;

interface SizeSelectorProps {
  selectedSize: string;
  onSizeChange: (value: string) => void;
}

export const SizeSelector = ({
  selectedSize,
  onSizeChange,
}: SizeSelectorProps) => {
  return (
    <div className="grid gap-2">
      <Label>Darstellungsgröße der Kategorie</Label>
      <Select
        value={selectedSize}
        onValueChange={onSizeChange}
      >
        <SelectTrigger>
          <SelectValue placeholder="Größe auswählen" />
        </SelectTrigger>
        <SelectContent>
          {sizes.map((size) => (
            <SelectItem key={size.value} value={size.value}>
              {size.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
