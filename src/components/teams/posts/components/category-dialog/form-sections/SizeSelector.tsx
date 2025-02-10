
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const sizes = [
  { value: 'small', name: 'Klein' },
  { value: 'medium', name: 'Mittel' },
  { value: 'large', name: 'Groß' }
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
