
import { CategoryNameInput } from "./form-sections/CategoryNameInput";
import { IconSelector } from "./form-sections/IconSelector";
import { ColorSelector } from "./form-sections/ColorSelector";
import { SizeSelector } from "./form-sections/SizeSelector";
import { VisibilityToggle } from "./form-sections/VisibilityToggle";

interface CategoryDialogFormProps {
  categoryName: string;
  isPublic: boolean;
  selectedIcon: string;
  selectedColor: string;
  selectedSize: string;
  onCategoryNameChange: (value: string) => void;
  onPublicChange: (value: boolean) => void;
  onIconChange: (value: string) => void;
  onColorChange: (value: string) => void;
  onSizeChange: (value: string) => void;
}

export const CategoryDialogForm = ({
  categoryName,
  isPublic,
  selectedIcon,
  selectedColor,
  selectedSize,
  onCategoryNameChange,
  onPublicChange,
  onIconChange,
  onColorChange,
  onSizeChange,
}: CategoryDialogFormProps) => {
  return (
    <div className="space-y-4 py-4">
      <CategoryNameInput
        value={categoryName}
        onChange={onCategoryNameChange}
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

      <VisibilityToggle
        isPublic={isPublic}
        onChange={onPublicChange}
      />
    </div>
  );
};
