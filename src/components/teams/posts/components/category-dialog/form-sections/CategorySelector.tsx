
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface CategorySelectorProps {
  selectedCategory: string;
  onCategoryChange: (value: string) => void;
  categories?: any[];
  isAdmin?: boolean;
}

export const CategorySelector = ({
  selectedCategory,
  onCategoryChange,
  categories,
  isAdmin = false
}: CategorySelectorProps) => {
  return (
    <div className="grid gap-2">
      <Select
        value={selectedCategory}
        onValueChange={onCategoryChange}
      >
        <SelectTrigger>
          <SelectValue placeholder="Kategorie auswählen oder neue erstellen" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="new">Neue Kategorie</SelectItem>
          {categories?.filter(category => isAdmin || category.is_public).map((category) => (
            <SelectItem key={category.id} value={category.id}>
              {category.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
