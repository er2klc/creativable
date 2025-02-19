
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface CategoryDialogFormProps {
  teamSlug: string;
  initialData?: any;
  onSuccess: () => void;
  onCancel?: () => void;
}

export const CategoryDialogForm = ({ 
  teamSlug,
  initialData,
  onSuccess,
  onCancel 
}: CategoryDialogFormProps) => {
  const [name, setName] = useState(initialData?.name || '');
  const [isPublic, setIsPublic] = useState(initialData?.is_public ?? true);
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: async (data: { name: string; is_public: boolean }) => {
      const { data: team } = await supabase
        .from('teams')
        .select('id')
        .eq('slug', teamSlug)
        .single();

      if (!team) throw new Error('Team not found');

      const { data: category, error } = await supabase
        .from('team_categories')
        .insert([
          {
            team_id: team.id,
            name: data.name,
            is_public: data.is_public,
            slug: data.name.toLowerCase().replace(/\s+/g, '-')
          }
        ])
        .select()
        .single();

      if (error) throw error;
      return category;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-categories'] });
      toast.success('Kategorie erfolgreich erstellt');
      onSuccess();
    },
    onError: (error) => {
      toast.error('Fehler beim Erstellen der Kategorie');
      console.error('Error creating category:', error);
    }
  });

  const updateMutation = useMutation({
    mutationFn: async (data: { name: string; is_public: boolean }) => {
      const { error } = await supabase
        .from('team_categories')
        .update({
          name: data.name,
          is_public: data.is_public,
          slug: data.name.toLowerCase().replace(/\s+/g, '-')
        })
        .eq('id', initialData.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-categories'] });
      toast.success('Kategorie erfolgreich aktualisiert');
      onSuccess();
    },
    onError: (error) => {
      toast.error('Fehler beim Aktualisieren der Kategorie');
      console.error('Error updating category:', error);
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const data = {
      name,
      is_public: isPublic
    };

    if (initialData) {
      await updateMutation.mutateAsync(data);
    } else {
      await createMutation.mutateAsync(data);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Kategoriename"
          required
        />
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="is-public"
          checked={isPublic}
          onCheckedChange={setIsPublic}
        />
        <Label htmlFor="is-public">Öffentlich</Label>
      </div>

      <div className="flex justify-end gap-2">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
          >
            Abbrechen
          </Button>
        )}
        <Button type="submit">
          {initialData ? 'Aktualisieren' : 'Erstellen'}
        </Button>
      </div>
    </form>
  );
};
