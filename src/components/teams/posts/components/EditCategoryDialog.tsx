
import { useState } from "react";
import { Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface EditCategoryDialogProps {
  teamId?: string;
}

export const EditCategoryDialog = ({ teamId }: EditCategoryDialogProps) => {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [selectedCategory, setSelectedCategory] = useState<string>("new");
  const [categoryName, setCategoryName] = useState("");
  const [categorySize, setCategorySize] = useState("default");

  // Fetch existing categories
  const { data: categories } = useQuery({
    queryKey: ["team-categories", teamId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("team_categories")
        .select(`
          *,
          team_category_settings(*)
        `)
        .eq("team_id", teamId)
        .order("order_index");

      if (error) throw error;
      return data;
    },
    enabled: !!teamId,
  });

  // Update category state when selection changes
  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value);
    if (value === "new") {
      setCategoryName("");
      setCategorySize("default");
    } else {
      const category = categories?.find(cat => cat.id === value);
      if (category) {
        setCategoryName(category.name);
        setCategorySize(category.team_category_settings?.[0]?.size || "default");
      }
    }
  };

  const handleSave = async () => {
    try {
      if (selectedCategory !== "new") {
        // Update category
        const { error } = await supabase
          .from("team_categories")
          .update({ name: categoryName })
          .eq("id", selectedCategory);

        if (error) throw error;

        // Update or insert category settings
        const { error: settingsError } = await supabase
          .from("team_category_settings")
          .upsert({
            team_id: teamId,
            category_id: selectedCategory,
            size: categorySize,
          });

        if (settingsError) throw settingsError;
      } else {
        // Create new category
        const { data, error } = await supabase
          .from("team_categories")
          .insert({
            team_id: teamId,
            name: categoryName,
          })
          .select()
          .single();

        if (error) throw error;

        // Create category settings
        if (data) {
          const { error: settingsError } = await supabase
            .from("team_category_settings")
            .insert({
              team_id: teamId,
              category_id: data.id,
              size: categorySize,
            });

          if (settingsError) throw settingsError;
        }
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

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon">
          <Settings className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Kategorien verwalten</DialogTitle>
          <DialogDescription>
            Hier können Sie Kategorien erstellen, bearbeiten und löschen.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Select
              value={selectedCategory}
              onValueChange={handleCategoryChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Kategorie auswählen oder neue erstellen" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="new">Neue Kategorie</SelectItem>
                {categories?.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Input
              placeholder="Kategoriename"
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Select
              value={categorySize}
              onValueChange={(value) => setCategorySize(value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Größe auswählen" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Standard</SelectItem>
                <SelectItem value="large">Groß</SelectItem>
                <SelectItem value="small">Klein</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-between gap-2">
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
        </div>
      </DialogContent>
    </Dialog>
  );
};
