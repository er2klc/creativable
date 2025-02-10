
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
      <Input
        placeholder="Kategoriename"
        value={categoryName}
        onChange={(e) => onCategoryNameChange(e.target.value)}
      />
    </div>
  );
};
