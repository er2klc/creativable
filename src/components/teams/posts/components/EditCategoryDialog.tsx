
import { useState } from "react";
import { Settings, Lock, Unlock, MessageCircle, Megaphone, Calendar, Trophy, Video, Users, Star, Heart, HelpCircle, Rocket, FileText, Lightbulb, Target } from "lucide-react";
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
import { Switch } from "@/components/ui/switch";

interface EditCategoryDialogProps {
  teamId?: string;
}

const availableIcons = [
  { name: 'MessageCircle', icon: MessageCircle },
  { name: 'Megaphone', icon: Megaphone },
  { name: 'Calendar', icon: Calendar },
  { name: 'Trophy', icon: Trophy },
  { name: 'Video', icon: Video },
  { name: 'Users', icon: Users },
  { name: 'Star', icon: Star },
  { name: 'Heart', icon: Heart },
  { name: 'HelpCircle', icon: HelpCircle },
  { name: 'Rocket', icon: Rocket },
  { name: 'FileText', icon: FileText },
  { name: 'Lightbulb', icon: Lightbulb },
  { name: 'Target', icon: Target }
];

const availableColors = [
  { name: 'Grün', value: 'bg-[#F2FCE2] hover:bg-[#E2ECD2] text-[#2A4A2A]' },
  { name: 'Gelb', value: 'bg-[#FEF7CD] hover:bg-[#EEE7BD] text-[#8B7355]' },
  { name: 'Orange', value: 'bg-[#FEC6A1] hover:bg-[#EEB691] text-[#8B4513]' },
  { name: 'Lila', value: 'bg-[#E5DEFF] hover:bg-[#D5CEEF] text-[#483D8B]' },
  { name: 'Rosa', value: 'bg-[#FFDEE2] hover:bg-[#EFCED2] text-[#8B3D3D]' },
  { name: 'Pfirsich', value: 'bg-[#FDE1D3] hover:bg-[#EDD1C3] text-[#8B5742]' },
  { name: 'Blau', value: 'bg-[#D3E4FD] hover:bg-[#C3D4ED] text-[#4A708B]' },
  { name: 'Grau', value: 'bg-[#F1F0FB] hover:bg-[#E1E0EB] text-[#4A4A4A]' },
];

const sizes = [
  { name: 'Klein', value: 'small' },
  { name: 'Medium', value: 'medium' },
  { name: 'Groß', value: 'large' },
];

export const EditCategoryDialog = ({ teamId }: EditCategoryDialogProps) => {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [selectedCategory, setSelectedCategory] = useState<string>("new");
  const [categoryName, setCategoryName] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [selectedIcon, setSelectedIcon] = useState("MessageCircle");
  const [selectedColor, setSelectedColor] = useState(availableColors[0].value);
  const [selectedSize, setSelectedSize] = useState("small");

  // First fetch team by slug
  const { data: team } = useQuery({
    queryKey: ['team', teamId],
    queryFn: async () => {
      console.log('Fetching team with slug:', teamId);
      
      const { data, error } = await supabase
        .from('teams')
        .select('id')
        .eq('slug', teamId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching team:', error);
        throw error;
      }

      console.log('Found team:', data);
      return data;
    },
    enabled: !!teamId,
  });

  // Then fetch categories using team UUID
  const { data: categories } = useQuery({
    queryKey: ['team-categories', team?.id],
    queryFn: async () => {
      console.log('Fetching categories for team ID:', team?.id);
      
      if (!team?.id) {
        console.log('No team ID available, skipping categories fetch');
        return [];
      }

      const { data: categories, error: categoriesError } = await supabase
        .from('team_categories')
        .select('*')
        .eq('team_id', team.id)
        .order('order_index');

      if (categoriesError) {
        console.error('Error fetching categories:', categoriesError);
        throw categoriesError;
      }

      // Fetch category settings
      const { data: settings, error: settingsError } = await supabase
        .from('team_category_settings')
        .select('*')
        .eq('team_id', team.id);

      if (settingsError) {
        console.error('Error fetching category settings:', settingsError);
        throw settingsError;
      }

      // Merge categories with their settings
      const categoriesWithSettings = categories.map(category => {
        const setting = settings.find(s => s.category_id === category.id);
        return {
          ...category,
          size: setting?.size || 'small'
        };
      });

      console.log('Found categories:', categoriesWithSettings);
      return categoriesWithSettings;
    },
    enabled: !!team?.id,
  });

  // Update category state when selection changes
  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value);
    if (value === "new") {
      setCategoryName("");
      setIsPublic(true);
      setSelectedIcon("MessageCircle");
      setSelectedColor(availableColors[0].value);
      setSelectedSize("small");
    } else {
      const category = categories?.find(cat => cat.id === value);
      if (category) {
        setCategoryName(category.name);
        setIsPublic(category.is_public ?? true);
        setSelectedIcon(category.icon || "MessageCircle");
        setSelectedColor(category.color || availableColors[0].value);
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
        // Update category
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

        // Update or insert category settings
        const { error: settingsError } = await supabase
          .from("team_category_settings")
          .upsert({
            team_id: team.id,
            category_id: selectedCategory,
            size: selectedSize
          });

        if (settingsError) throw settingsError;
      } else {
        // Create new category
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

        // Create category settings
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

  const SelectedIconComponent = availableIcons.find(i => i.name === selectedIcon)?.icon || MessageCircle;

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
              value={selectedIcon}
              onValueChange={setSelectedIcon}
            >
              <SelectTrigger>
                <SelectValue>
                  <div className="flex items-center gap-2">
                    <SelectedIconComponent className="h-4 w-4" />
                    <span>{selectedIcon}</span>
                  </div>
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {availableIcons.map(({ name, icon: Icon }) => (
                  <SelectItem key={name} value={name}>
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4" />
                      <span>{name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Select
              value={selectedColor}
              onValueChange={setSelectedColor}
            >
              <SelectTrigger>
                <SelectValue placeholder="Farbe auswählen" />
              </SelectTrigger>
              <SelectContent>
                {availableColors.map((color) => (
                  <SelectItem key={color.value} value={color.value}>
                    <div className="flex items-center gap-2">
                      <div className={`w-4 h-4 rounded ${color.value.split(' ')[0]}`} />
                      <span>{color.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Select
              value={selectedSize}
              onValueChange={setSelectedSize}
            >
              <SelectTrigger>
                <SelectValue placeholder="Größe auswählen" />
              </SelectTrigger>
              <SelectContent>
                {sizes.map((size) => (
                  <SelectItem key={size.value} value={size.value}>
                    {size.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {isPublic ? <Unlock className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
              <span>Öffentlich</span>
            </div>
            <Switch
              checked={isPublic}
              onCheckedChange={setIsPublic}
            />
          </div>

          <div className="flex justify-between gap-2 pt-4">
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

