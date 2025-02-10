
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useCategoryDialog = (teamId?: string) => {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [selectedCategory, setSelectedCategory] = useState<string>("new");
  const [categoryName, setCategoryName] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [selectedIcon, setSelectedIcon] = useState("MessageCircle");
  const [selectedColor, setSelectedColor] = useState("bg-[#F2FCE2] hover:bg-[#E2ECD2] text-[#2A4A2A]");
  const [selectedSize, setSelectedSize] = useState("small");

  // First fetch team by slug
  const { data: team } = useQuery({
    queryKey: ['team', teamId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('teams')
        .select('id')
        .eq('slug', teamId)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!teamId,
  });

  // Then fetch categories using team UUID
  const { data: categories } = useQuery({
    queryKey: ['team-categories', team?.id],
    queryFn: async () => {
      if (!team?.id) return [];

      const { data: categories, error: categoriesError } = await supabase
        .from('team_categories')
        .select('*')
        .eq('team_id', team.id)
        .order('order_index');

      if (categoriesError) throw categoriesError;

      const { data: settings, error: settingsError } = await supabase
        .from('team_category_settings')
        .select('*')
        .eq('team_id', team.id);

      if (settingsError) throw settingsError;

      return categories.map(category => {
        const setting = settings.find(s => s.category_id === category.id);
        return {
          ...category,
          size: setting?.size || 'small'
        };
      });
    },
    enabled: !!team?.id,
  });

  const handleCategoryChange = (value: string) => {
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
        setCategoryName(category.name);
        setIsPublic(category.is_public ?? true);
        setSelectedIcon(category.icon || "MessageCircle");
        setSelectedColor(category.color || "bg-[#F2FCE2] hover:bg-[#E2ECD2] text-[#2A4A2A]");
        setSelectedSize(category.size || "small");
      }
    }
  };

  const handleSave = async () => {
    if (!team?.id) {
      toast({
        title: "Fehler",
        description: "Team ID nicht gefunden",
        variant: "destructive"
      });
      return;
    }

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
            team_id: team.id,
            category_id: selectedCategory,
            size: selectedSize
          });

        if (settingsError) throw settingsError;
      } else {
        const { data: newCategory, error: categoryError } = await supabase
          .from("team_categories")
          .insert({
            team_id: team.id,
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
            team_id: team.id,
            category_id: newCategory.id,
            size: selectedSize
          });

        if (settingsError) throw settingsError;
      }

      await queryClient.invalidateQueries({ queryKey: ["team-categories"] });
      toast({ title: "Kategorie erfolgreich gespeichert" });
      setOpen(false);
    } catch (error) {
      console.error("Error saving category:", error);
      toast({ 
        title: "Fehler beim Speichern der Kategorie", 
        variant: "destructive" 
      });
    }
  };

  const handleDelete = async () => {
    if (selectedCategory === "new") return;

    try {
      const { error } = await supabase
        .from("team_categories")
        .delete()
        .eq("id", selectedCategory);

      if (error) throw error;

      await queryClient.invalidateQueries({ queryKey: ["team-categories"] });
      toast({ title: "Kategorie erfolgreich gelöscht" });
      setOpen(false);
    } catch (error) {
      console.error("Error deleting category:", error);
      toast({ 
        title: "Fehler beim Löschen der Kategorie", 
        variant: "destructive" 
      });
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
