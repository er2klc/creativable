
import { useState } from "react";
import { useCategoryQueries } from "./hooks/useCategoryQueries";
import { useCategoryMutations } from "./hooks/useCategoryMutations";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useCategoryDialog = (teamSlug?: string) => {
  const [open, setOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("new");
  const [categoryName, setCategoryName] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [selectedIcon, setSelectedIcon] = useState("MessageCircle");
  const [selectedColor, setSelectedColor] = useState("bg-[#F2FCE2] hover:bg-[#E2ECD2] text-[#2A4A2A]");
  const [selectedSize, setSelectedSize] = useState("small");

  // Load team ID from slug
  const { data: teamData } = useQuery({
    queryKey: ['team-by-slug', teamSlug],
    queryFn: async () => {
      if (!teamSlug) return null;
      const { data, error } = await supabase
        .from('teams')
        .select('id')
        .eq('slug', teamSlug)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!teamSlug
  });

  const { team, categories } = useCategoryQueries(teamData?.id);
  const { handleSave: saveCategory, handleDelete: deleteCategory } = useCategoryMutations();

  const handleCategoryChange = (value: string) => {
    console.log("Changing category to:", value);
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
        console.log("Found category:", category);
        setCategoryName(category.name);
        setIsPublic(category.is_public ?? true);
        setSelectedIcon(category.icon || "MessageCircle");
        setSelectedColor(category.color || "bg-[#F2FCE2] hover:bg-[#E2ECD2] text-[#2A4A2A]");
        setSelectedSize(category.size || "small");
      }
    }
  };

  const handleSave = async () => {
    if (!teamData?.id) {
      toast.error("Team ID nicht gefunden");
      return;
    }
    
    if (!categoryName.trim()) {
      toast.error("Bitte geben Sie einen Kategorienamen ein");
      return;
    }

    try {
      const success = await saveCategory(
        teamData.id,
        selectedCategory,
        categoryName.trim(),
        isPublic,
        selectedIcon,
        selectedColor,
        selectedSize
      );

      if (success) {
        toast.success(selectedCategory === "new" ? "Kategorie erstellt" : "Kategorie aktualisiert");
        setOpen(false);
        setSelectedCategory("new");
        setCategoryName("");
      }
    } catch (error) {
      console.error("Error saving category:", error);
      toast.error("Fehler beim Speichern der Kategorie");
    }
  };

  const handleDelete = async () => {
    if (selectedCategory === "new") return;

    try {
      const success = await deleteCategory(selectedCategory);
      if (success) {
        toast.success("Kategorie gelöscht");
        setOpen(false);
        setSelectedCategory("new");
        setCategoryName("");
      }
    } catch (error) {
      console.error("Error deleting category:", error);
      toast.error("Fehler beim Löschen der Kategorie");
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
