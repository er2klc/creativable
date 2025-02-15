
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";

export const useCategoryMutations = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const handleSave = async (
    teamId: string,
    selectedCategory: string,
    categoryName: string,
    isPublic: boolean,
    selectedIcon: string,
    selectedColor: string,
    selectedSize: string
  ) => {
    if (!user) {
      console.error("No user found");
      toast.error("Nicht authentifiziert");
      return false;
    }

    console.log("Creating/updating category with data:", {
      teamId,
      selectedCategory,
      categoryName,
      isPublic,
      selectedIcon,
      selectedColor,
      selectedSize
    });

    try {
      if (selectedCategory !== "new") {
        console.log("Updating existing category:", selectedCategory);
        
        const { error: categoryError } = await supabase
          .from("team_categories")
          .update({ 
            name: categoryName,
            is_public: isPublic,
            icon: selectedIcon,
            color: selectedColor
          })
          .eq("id", selectedCategory);

        if (categoryError) {
          console.error("Error updating category:", categoryError);
          throw categoryError;
        }

        console.log("Category updated successfully");

        const { error: settingsError } = await supabase
          .from("team_category_settings")
          .upsert({
            team_id: teamId,
            category_id: selectedCategory,
            size: selectedSize
          });

        if (settingsError) {
          console.error("Error updating category settings:", settingsError);
          throw settingsError;
        }

        console.log("Category settings updated successfully");
      } else {
        console.log("Creating new category for team:", teamId);
        
        const { data: newCategory, error: categoryError } = await supabase
          .from("team_categories")
          .insert({
            team_id: teamId,
            name: categoryName,
            is_public: isPublic,
            icon: selectedIcon,
            color: selectedColor,
            created_by: user.id
          })
          .select()
          .single();

        if (categoryError) {
          console.error("Error creating category:", categoryError);
          throw categoryError;
        }

        console.log("New category created successfully:", newCategory);

        const { error: settingsError } = await supabase
          .from("team_category_settings")
          .insert({
            team_id: teamId,
            category_id: newCategory.id,
            size: selectedSize
          });

        if (settingsError) {
          console.error("Error creating category settings:", settingsError);
          throw settingsError;
        }

        console.log("Category settings created successfully");
      }

      await queryClient.invalidateQueries({ queryKey: ["team-categories"] });
      return true;
    } catch (error: any) {
      console.error("Detailed error in category mutation:", error);
      const errorMessage = error.message || "Fehler beim Speichern der Kategorie";
      toast.error(errorMessage);
      return false;
    }
  };

  const handleDelete = async (selectedCategory: string) => {
    if (selectedCategory === "new") return false;

    console.log("Deleting category:", selectedCategory);

    try {
      const { error } = await supabase
        .from("team_categories")
        .delete()
        .eq("id", selectedCategory);

      if (error) {
        console.error("Error deleting category:", error);
        throw error;
      }

      console.log("Category deleted successfully");
      await queryClient.invalidateQueries({ queryKey: ["team-categories"] });
      return true;
    } catch (error: any) {
      console.error("Detailed error in category deletion:", error);
      const errorMessage = error.message || "Fehler beim Löschen der Kategorie";
      toast.error(errorMessage);
      return false;
    }
  };

  return { handleSave, handleDelete };
};
