
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
import { AdminCategoriesScroll } from "./categories/AdminCategoriesScroll";
import { useState } from "react";
import { toast } from "sonner";
import { useTeamCategories } from "@/hooks/useTeamCategories";
import { useUser } from "@supabase/auth-helpers-react";

interface EditCategoryDialogProps {
  teamSlug: string;
}

export const EditCategoryDialog = ({ teamSlug }: EditCategoryDialogProps) => {
  const [open, setOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("new");
  const [categoryName, setCategoryName] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [selectedIcon, setSelectedIcon] = useState("MessageCircle");
  const [selectedColor, setSelectedColor] = useState("bg-[#F2FCE2] hover:bg-[#E2ECD2] text-[#2A4A2A]");
  const [selectedSize, setSelectedSize] = useState("small");
  
  const user = useUser();

  const { 
    categories,
    isLoading,
    createCategory,
    updateCategory,
    deleteCategory,
    isCreating,
    isUpdating,
    isDeleting
  } = useTeamCategories(teamSlug);

  const handleCategoryChange = (value: string) => {
    console.log('Category changed to:', value);
    setSelectedCategory(value);
    
    if (value === "new") {
      setCategoryName("");
      setIsPublic(true);
      setSelectedIcon("MessageCircle");
      setSelectedColor("bg-[#F2FCE2] hover:bg-[#E2ECD2] text-[#2A4A2A]");
      setSelectedSize("small");
    } else {
      const category = categories?.find(cat => cat.id === value);
      if (category) {
        console.log('Loading category data:', category);
        setCategoryName(category.name);
        setIsPublic(category.is_public ?? true);
        setSelectedIcon(category.icon || "MessageCircle");
        setSelectedColor(category.color || "bg-[#F2FCE2] hover:bg-[#E2ECD2] text-[#2A4A2A]");
        setSelectedSize(category.settings?.size || "small");
      }
    }
  };

  const handleSubmit = async () => {
    if (!categoryName.trim()) {
      toast.error("Bitte geben Sie einen Kategorienamen ein");
      return;
    }

    if (!user) {
      toast.error("Sie müssen angemeldet sein");
      return;
    }

    console.log('Submitting category:', {
      name: categoryName,
      isPublic,
      icon: selectedIcon,
      color: selectedColor,
      size: selectedSize
    });

    try {
      if (selectedCategory === "new") {
        await createCategory({
          name: categoryName.trim(),
          is_public: isPublic,
          icon: selectedIcon,
          color: selectedColor,
          created_by: user.id
        });
        toast.success("Kategorie erfolgreich erstellt");
      } else {
        await updateCategory({
          id: selectedCategory,
          name: categoryName.trim(),
          is_public: isPublic,
          icon: selectedIcon,
          color: selectedColor
        });
        toast.success("Kategorie erfolgreich aktualisiert");
      }
      setOpen(false);
    } catch (error) {
      console.error("Error saving category:", error);
      toast.error("Fehler beim Speichern der Kategorie");
    }
  };

  const handleDelete = async () => {
    if (selectedCategory === "new") return;

    try {
      await deleteCategory(selectedCategory);
      toast.success("Kategorie erfolgreich gelöscht");
      setOpen(false);
    } catch (error) {
      console.error("Error deleting category:", error);
      toast.error("Fehler beim Löschen der Kategorie");
    }
  };

  const isSubmitting = isCreating || isUpdating || isDeleting;

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
            teamSlug={teamSlug}
          />
        </div>
        
        {isLoading ? (
          <div className="py-4 text-center text-muted-foreground">
            Laden...
          </div>
        ) : (
          <CategoryDialogForm
            categoryName={categoryName}
            isPublic={isPublic}
            selectedIcon={selectedIcon}
            selectedColor={selectedColor}
            selectedSize={selectedSize}
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
