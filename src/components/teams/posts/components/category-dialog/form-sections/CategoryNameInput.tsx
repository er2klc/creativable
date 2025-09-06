
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface CategoryNameInputProps {
  value: string;
  onChange: (value: string) => void;
}

export const CategoryNameInput = ({
  value,
  onChange,
}: CategoryNameInputProps) => {
  return (
    <div className="grid gap-2">
      <Label htmlFor="categoryName">Kategoriename</Label>
      <Input
        id="categoryName"
        placeholder="Name der Kategorie"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
};
