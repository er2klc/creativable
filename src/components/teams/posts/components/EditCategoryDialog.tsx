
import { Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { CategoryDialogForm } from "./category-dialog/CategoryDialogForm";
import { useCategoryDialog } from "./category-dialog/useCategoryDialog";

interface EditCategoryDialogProps {
  teamId?: string;
}

export const EditCategoryDialog = ({ teamId }: EditCategoryDialogProps) => {
  const {
    open,
    setOpen,
    selectedCategory,
    categoryName,
    isPublic,
    selectedIcon,
    selectedColor,
    selectedSize,
    categories,
    handleCategoryChange,
    setCategoryName,
    setIsPublic,
    setSelectedIcon,
    setSelectedColor,
    setSelectedSize,
    handleSave,
    handleDelete
  } = useCategoryDialog(teamId);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon">
          <Settings className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[725px]">
        <DialogHeader>
          <DialogTitle>Kategorien verwalten</DialogTitle>
          <DialogDescription>
            Hier können Sie Kategorien erstellen, bearbeiten und löschen.
          </DialogDescription>
        </DialogHeader>
        
        <CategoryDialogForm
          selectedCategory={selectedCategory}
          categoryName={categoryName}
          isPublic={isPublic}
          selectedIcon={selectedIcon}
          selectedColor={selectedColor}
          selectedSize={selectedSize}
          onCategoryChange={handleCategoryChange}
          onCategoryNameChange={setCategoryName}
          onPublicChange={setIsPublic}
          onIconChange={setSelectedIcon}
          onColorChange={setSelectedColor}
          onSizeChange={setSelectedSize}
          categories={categories}
        />

        <div className="flex justify-between gap-2 pt-4">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Abbrechen
          </Button>
          <div className="flex gap-2">
            {selectedCategory !== "new" && (
              <Button variant="destructive" onClick={handleDelete}>
                Löschen
              </Button>
            )}
            <Button onClick={handleSave}>
              {selectedCategory !== "new" ? "Speichern" : "Erstellen"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
