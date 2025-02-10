
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Lock, Unlock } from "lucide-react";
import { availableIcons, availableColors, sizes } from "./constants";

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
  const SelectedIconComponent = availableIcons.find(i => i.name === selectedIcon)?.icon || availableIcons[0].icon;

  return (
    <div className="grid gap-4 py-4">
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
      
      <div className="grid gap-2">
        <Input
          placeholder="Kategoriename"
          value={categoryName}
          onChange={(e) => onCategoryNameChange(e.target.value)}
        />
      </div>

      <div className="grid gap-2">
        <Select
          value={selectedIcon}
          onValueChange={onIconChange}
        >
          <SelectTrigger>
            <SelectValue>
              <div className="flex items-center gap-2">
                <SelectedIconComponent className="h-4 w-4" />
                <span>{selectedIcon}</span>
              </div>
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {availableIcons.map(({ name, icon: Icon }) => (
              <SelectItem key={name} value={name}>
                <div className="flex items-center gap-2">
                  <Icon className="h-4 w-4" />
                  <span>{name}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-2">
        <Select
          value={selectedColor}
          onValueChange={onColorChange}
        >
          <SelectTrigger>
            <SelectValue placeholder="Farbe auswählen" />
          </SelectTrigger>
          <SelectContent>
            {availableColors.map((color) => (
              <SelectItem key={color.value} value={color.value}>
                <div className="flex items-center gap-2">
                  <div className={`w-4 h-4 rounded ${color.value.split(' ')[0]}`} />
                  <span>{color.name}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

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

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isPublic ? <Unlock className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
          <span>Öffentlich</span>
        </div>
        <Switch
          checked={isPublic}
          onCheckedChange={onPublicChange}
        />
      </div>
    </div>
  );
};
