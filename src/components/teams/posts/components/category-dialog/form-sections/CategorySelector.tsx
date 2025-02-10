
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface CategorySelectorProps {
  selectedCategory: string;
  onCategoryChange: (value: string) => void;
  categories?: any[];
}

export const CategorySelector = ({
  selectedCategory,
  onCategoryChange,
  categories
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
          {categories?.map((category) => (
            <SelectItem key={category.id} value={category.id}>
              {category.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
