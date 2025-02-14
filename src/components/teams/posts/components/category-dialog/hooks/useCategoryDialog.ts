
import { useState } from "react";
import { useCategoryQueries } from "./useCategoryQueries";
import { useCategoryMutations } from "./useCategoryMutations";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

export const useCategoryDialog = (teamId?: string) => {
  const [open, setOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("new");
  const [categoryName, setCategoryName] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [selectedIcon, setSelectedIcon] = useState("MessageCircle");
  const [selectedColor, setSelectedColor] = useState("bg-[#F2FCE2] hover:bg-[#E2ECD2] text-[#2A4A2A]");
  const [selectedSize, setSelectedSize] = useState("small");
  const [isLoading, setIsLoading] = useState(false);
  
  const queryClient = useQueryClient();
  const { categories } = useCategoryQueries(teamId);
  const { handleSave: saveCategory, handleDelete: deleteCategory } = useCategoryMutations();

  const handleCategoryChange = async (value: string) => {
    console.log("Changing category to:", value);
    setSelectedCategory(value);
    setIsLoading(true);
    
    try {
      if (value === "new") {
        // Reset form for new category
        setCategoryName("");
        setIsPublic(true);
        setSelectedIcon("MessageCircle");
        setSelectedColor("bg-[#F2FCE2] hover:bg-[#E2ECD2] text-[#2A4A2A]");
        setSelectedSize("small");
      } else {
        // Find and populate form with existing category data
        const category = categories?.find(cat => cat.id === value);
        if (category) {
          console.log("Loading category data:", category);
          setCategoryName(category.name);
          setIsPublic(category.is_public);
          setSelectedIcon(category.icon);
          setSelectedColor(category.color);
          setSelectedSize(category.size);
        } else {
          console.error("Category not found:", value);
          toast.error("Kategorie konnte nicht gefunden werden");
        }
      }
    } catch (error) {
      console.error("Error loading category:", error);
      toast.error("Fehler beim Laden der Kategorie");
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
        // Invalidate queries to refresh the data
        await queryClient.invalidateQueries({ queryKey: ['team-categories'] });
        
        toast.success(selectedCategory === "new" ? "Kategorie erstellt" : "Kategorie aktualisiert");
        setOpen(false);
        
        // Reset form
        if (selectedCategory === "new") {
          setSelectedCategory("new");
          setCategoryName("");
          setIsPublic(true);
          setSelectedIcon("MessageCircle");
          setSelectedColor("bg-[#F2FCE2] hover:bg-[#E2ECD2] text-[#2A4A2A]");
          setSelectedSize("small");
        }
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
        // Invalidate queries to refresh the data
        await queryClient.invalidateQueries({ queryKey: ['team-categories'] });
        
        toast.success("Kategorie gelöscht");
        setOpen(false);
        setSelectedCategory("new");
        setCategoryName("");
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
    isLoading,
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
