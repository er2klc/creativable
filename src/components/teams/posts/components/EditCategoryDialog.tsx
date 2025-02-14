
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
import { AdminCategoriesScroll } from "./categories/AdminCategoriesScroll";
import { useParams } from "react-router-dom";
import { useState } from "react";

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
    isLoading,
    handleCategoryChange,
    setCategoryName,
    setIsPublic,
    setSelectedIcon,
    setSelectedColor,
    setSelectedSize,
    handleSave,
    handleDelete
  } = useCategoryDialog(teamId);

  const { teamSlug } = useParams();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!categoryName.trim()) return;
    setIsSubmitting(true);
    try {
      await handleSave();
      setOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

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

        <div className="max-h-[400px] overflow-auto">
          <AdminCategoriesScroll
            activeTab={selectedCategory}
            onCategoryClick={handleCategoryChange}
            teamSlug={teamSlug || ''}
          />
        </div>
        
        {isLoading ? (
          <div className="py-4 text-center text-muted-foreground">
            Laden...
          </div>
        ) : (
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
        )}

        <div className="flex justify-between gap-2 pt-4">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Abbrechen
          </Button>
          <div className="flex gap-2">
            {selectedCategory !== "new" && (
              <Button 
                variant="destructive" 
                onClick={handleDelete}
                disabled={isSubmitting || isLoading}
              >
                Löschen
              </Button>
            )}
            <Button 
              onClick={handleSubmit}
              disabled={isSubmitting || isLoading || !categoryName.trim()}
            >
              {selectedCategory !== "new" ? "Speichern" : "Erstellen"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
