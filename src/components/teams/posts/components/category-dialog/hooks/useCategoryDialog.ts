
import { useState } from "react";
import { useTeamCategories } from "@/hooks/useTeamCategories";
import { useCategoryMutations } from "./useCategoryMutations";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

const defaultColor = "bg-[#F2FCE2] hover:bg-[#E2ECD2] text-[#2A4A2A]";
const defaultIcon = "MessageCircle";

export const useCategoryDialog = (teamId?: string) => {
  const [open, setOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("new");
  const [categoryName, setCategoryName] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [selectedIcon, setSelectedIcon] = useState(defaultIcon);
  const [selectedColor, setSelectedColor] = useState(defaultColor);
  const [selectedSize, setSelectedSize] = useState("small");
  const [isLoading, setIsLoading] = useState(false);
  
  const queryClient = useQueryClient();
  const { data: categories, isLoading: isCategoriesLoading } = useTeamCategories(teamId);
  const { handleSave: saveCategory, handleDelete: deleteCategory } = useCategoryMutations();

  const resetForm = () => {
    setCategoryName("");
    setIsPublic(true);
    setSelectedIcon(defaultIcon);
    setSelectedColor(defaultColor);
    setSelectedSize("small");
  };

  const handleCategoryChange = async (value: string) => {
    console.log("Changing category to:", value);
    setSelectedCategory(value);
    setIsLoading(true);
    
    try {
      if (value === "new") {
        resetForm();
      } else {
        const category = categories?.find(cat => cat.id === value);
        if (category) {
          console.log("Loading category data:", category);
          setCategoryName(category.name);
          setIsPublic(category.is_public ?? true);
          setSelectedIcon(category.icon || defaultIcon);
          setSelectedColor(category.color || defaultColor);
          setSelectedSize(category.settings?.size || 'small');
        } else {
          console.error("Category not found:", value);
          toast.error("Kategorie konnte nicht gefunden werden");
          resetForm();
        }
      }
    } catch (error) {
      console.error("Error loading category:", error);
      toast.error("Fehler beim Laden der Kategorie");
      resetForm();
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!teamId) {
      toast.error("Team nicht gefunden");
      return;
    }
    
    if (!categoryName.trim()) {
      toast.error("Bitte geben Sie einen Kategorienamen ein");
      return;
    }

    setIsLoading(true);
    try {
      const success = await saveCategory(
        teamId,
        selectedCategory,
        categoryName.trim(),
        isPublic,
        selectedIcon,
        selectedColor,
        selectedSize
      );

      if (success) {
        await queryClient.invalidateQueries({ queryKey: ['team-categories'] });
        toast.success(selectedCategory === "new" ? "Kategorie erstellt" : "Kategorie aktualisiert");
        setOpen(false);
        resetForm();
      }
    } catch (error) {
      console.error("Error saving category:", error);
      toast.error("Fehler beim Speichern der Kategorie");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (selectedCategory === "new") return;

    setIsLoading(true);
    try {
      const success = await deleteCategory(selectedCategory);
      if (success) {
        await queryClient.invalidateQueries({ queryKey: ['team-categories'] });
        toast.success("Kategorie gelöscht");
        setOpen(false);
        resetForm();
      }
    } catch (error) {
      console.error("Error deleting category:", error);
      toast.error("Fehler beim Löschen der Kategorie");
    } finally {
      setIsLoading(false);
    }
  };

  return {
    open,
    setOpen,
    selectedCategory,
    categoryName,
    isPublic,
    selectedIcon,
    selectedColor,
    selectedSize,
    categories,
    isLoading: isLoading || isCategoriesLoading,
    handleCategoryChange,
    setCategoryName,
    setIsPublic,
    setSelectedIcon,
    setSelectedColor,
    setSelectedSize,
    handleSave,
    handleDelete
  };
};
