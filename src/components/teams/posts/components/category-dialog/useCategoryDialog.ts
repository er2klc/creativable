
import { useState } from "react";
import { useCategoryQueries } from "./hooks/useCategoryQueries";
import { useCategoryMutations } from "./hooks/useCategoryMutations";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useCategoryDialog = (teamFullPath?: string) => {
  const [open, setOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("new");
  const [categoryName, setCategoryName] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [selectedIcon, setSelectedIcon] = useState("MessageCircle");
  const [selectedColor, setSelectedColor] = useState("bg-[#F2FCE2] hover:bg-[#E2ECD2] text-[#2A4A2A]");
  const [selectedSize, setSelectedSize] = useState("small");

  // Direkt die Team ID aus der URL extrahieren
  const { data: teamData } = useQuery({
    queryKey: ['team-by-slug', teamFullPath],
    queryFn: async () => {
      if (!teamFullPath) {
        console.error("No team path provided");
        return null;
      }

      // Extract team slug from the full path (e.g., "fire-adler-hauptteam-" from "unity/team/fire-adler-hauptteam-/posts/...")
      const teamSlug = teamFullPath.split('/').find(part => part.includes('hauptteam'));
      
      if (!teamSlug) {
        console.error("Could not extract team slug from path:", teamFullPath);
        return null;
      }

      console.log("Fetching team data for slug:", teamSlug);
      const { data, error } = await supabase
        .from('teams')
        .select('id')
        .eq('slug', teamSlug)
        .maybeSingle();

      if (error) {
        console.error("Error fetching team:", error);
        throw error;
      }

      console.log("Found team data:", data);
      return data;
    },
    enabled: !!teamFullPath,
  });

  const { team, categories } = useCategoryQueries(teamData?.id);
  const { handleSave: saveCategory, handleDelete: deleteCategory } = useCategoryMutations();

  const handleCategoryChange = (value: string) => {
    console.log("Changing category to:", value);
    setSelectedCategory(value);
    
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
        console.log("Found category data:", category);
        setCategoryName(category.name);
        setIsPublic(category.is_public ?? true);
        setSelectedIcon(category.icon || "MessageCircle");
        setSelectedColor(category.color || "bg-[#F2FCE2] hover:bg-[#E2ECD2] text-[#2A4A2A]");
        setSelectedSize(category.size || "small");
      } else {
        console.error("Category not found:", value);
      }
    }
  };

  const handleSave = async () => {
    if (!teamData?.id) {
      console.error("Team nicht gefunden");
      toast.error("Team nicht gefunden. Bitte laden Sie die Seite neu.");
      return;
    }
    
    if (!categoryName.trim()) {
      toast.error("Bitte geben Sie einen Kategorienamen ein");
      return;
    }

    try {
      console.log("Saving category with team ID:", teamData.id);
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
        // Reset form
        setSelectedCategory("new");
        setCategoryName("");
        setIsPublic(true);
        setSelectedIcon("MessageCircle");
        setSelectedColor("bg-[#F2FCE2] hover:bg-[#E2ECD2] text-[#2A4A2A]");
        setSelectedSize("small");
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
