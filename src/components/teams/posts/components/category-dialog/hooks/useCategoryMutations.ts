
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useCategoryMutations = () => {
  const queryClient = useQueryClient();

  const handleSave = async (
    teamId: string,
    selectedCategory: string,
    categoryName: string,
    isPublic: boolean,
    selectedIcon: string,
    selectedColor: string,
    selectedSize: string
  ) => {
    try {
      if (selectedCategory !== "new") {
        const { error: categoryError } = await supabase
          .from("team_categories")
          .update({ 
            name: categoryName,
            is_public: isPublic,
            icon: selectedIcon,
            color: selectedColor
          })
          .eq("id", selectedCategory);

        if (categoryError) throw categoryError;

        const { error: settingsError } = await supabase
          .from("team_category_settings")
          .upsert({
            team_id: teamId,
            category_id: selectedCategory,
            size: selectedSize
          });

        if (settingsError) throw settingsError;
      } else {
        const { data: newCategory, error: categoryError } = await supabase
          .from("team_categories")
          .insert({
            team_id: teamId,
            name: categoryName,
            is_public: isPublic,
            icon: selectedIcon,
            color: selectedColor
          })
          .select()
          .single();

        if (categoryError) throw categoryError;

        const { error: settingsError } = await supabase
          .from("team_category_settings")
          .insert({
            team_id: teamId,
            category_id: newCategory.id,
            size: selectedSize
          });

        if (settingsError) throw settingsError;
      }

      await queryClient.invalidateQueries({ queryKey: ["team-categories"] });
      toast.success("Kategorie erfolgreich gespeichert");
      return true;
    } catch (error) {
      console.error("Error saving category:", error);
      toast.error("Fehler beim Speichern der Kategorie");
      return false;
    }
  };

  const handleDelete = async (selectedCategory: string) => {
    if (selectedCategory === "new") return false;

    try {
      const { error } = await supabase
        .from("team_categories")
        .delete()
        .eq("id", selectedCategory);

      if (error) throw error;

      await queryClient.invalidateQueries({ queryKey: ["team-categories"] });
      toast.success("Kategorie erfolgreich gelöscht");
      return true;
    } catch (error) {
      console.error("Error deleting category:", error);
      toast.error("Fehler beim Löschen der Kategorie");
      return false;
    }
  };

  return { handleSave, handleDelete };
};
