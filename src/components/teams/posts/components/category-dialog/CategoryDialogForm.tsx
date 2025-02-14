
import { CategorySelector } from "./form-sections/CategorySelector";
import { CategoryNameInput } from "./form-sections/CategoryNameInput";
import { IconSelector } from "./form-sections/IconSelector";
import { ColorSelector } from "./form-sections/ColorSelector";
import { SizeSelector } from "./form-sections/SizeSelector";
import { VisibilityToggle } from "./form-sections/VisibilityToggle";

interface CategoryDialogFormProps {
  selectedCategory: string;
  categoryName: string;
  isPublic: boolean;
  selectedIcon: string;
  selectedColor: string;
  selectedSize: string;
  onCategoryChange: (value: string) => void;
  onCategoryNameChange: (value: string) => void;
  onPublicChange: (value: boolean) => void;
  onIconChange: (value: string) => void;
  onColorChange: (value: string) => void;
  onSizeChange: (value: string) => void;
  categories?: any[];
}

export const CategoryDialogForm = ({
  selectedCategory,
  categoryName,
  isPublic,
  selectedIcon,
  selectedColor,
  selectedSize,
  onCategoryChange,
  onCategoryNameChange,
  onPublicChange,
  onIconChange,
  onColorChange,
  onSizeChange,
  categories
}: CategoryDialogFormProps) => {
  console.log("CategoryDialogForm rendered with:", {
    selectedCategory,
    categoryName,
    isPublic,
    selectedIcon,
    selectedColor,
    selectedSize
  });

  return (
    <div className="space-y-4 py-4">
      <CategorySelector
        selectedCategory={selectedCategory}
        onCategoryChange={onCategoryChange}
        categories={categories}
      />

      <CategoryNameInput
        value={categoryName}
        onChange={onCategoryNameChange}
      />

      <VisibilityToggle
        isPublic={isPublic}
        onChange={onPublicChange}
      />

      <IconSelector
        selectedIcon={selectedIcon}
        onChange={onIconChange}
      />

      <ColorSelector
        selectedColor={selectedColor}
        onChange={onColorChange}
      />

      <SizeSelector
        selectedSize={selectedSize}
        onChange={onSizeChange}
      />
    </div>
  );
};
