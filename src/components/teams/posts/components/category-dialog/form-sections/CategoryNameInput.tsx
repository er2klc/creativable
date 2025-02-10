
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface CategoryNameInputProps {
  categoryName: string;
  onCategoryNameChange: (value: string) => void;
}

export const CategoryNameInput = ({
  categoryName,
  onCategoryNameChange,
}: CategoryNameInputProps) => {
  return (
    <div className="grid gap-2">
      <Label htmlFor="categoryName">Kategoriename</Label>
      <Input
        id="categoryName"
        placeholder="Name der Kategorie"
        value={categoryName}
        onChange={(e) => onCategoryNameChange(e.target.value)}
      />
    </div>
  );
};
