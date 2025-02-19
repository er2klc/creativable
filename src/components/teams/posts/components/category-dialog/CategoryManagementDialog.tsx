
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useTeamCategories } from "@/hooks/useTeamCategories";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Trash2, Pencil } from "lucide-react";
import { CategoryDialogForm } from "./CategoryDialogForm";
import { toast } from "sonner";

interface CategoryManagementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  teamSlug: string;
}

export const CategoryManagementDialog = ({ 
  open, 
  onOpenChange,
  teamSlug 
}: CategoryManagementDialogProps) => {
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const { data: categories } = useTeamCategories(teamSlug);
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: async (categoryId: string) => {
      const { error } = await supabase
        .from('team_categories')
        .delete()
        .eq('id', categoryId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-categories'] });
      toast.success('Kategorie erfolgreich gelöscht');
    },
    onError: (error) => {
      toast.error('Fehler beim Löschen der Kategorie');
      console.error('Error deleting category:', error);
    }
  });

  const handleEditCategory = (category: any) => {
    setEditingCategory(category);
  };

  const handleDeleteCategory = async (categoryId: string) => {
    if (window.confirm('Möchten Sie diese Kategorie wirklich löschen?')) {
      await deleteMutation.mutateAsync(categoryId);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Kategorien verwalten</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="grid gap-4">
            {categories?.map((category) => (
              <div 
                key={category.id} 
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex items-center gap-2">
                  <span>{category.name}</span>
                  {!category.is_public && (
                    <span className="text-xs text-muted-foreground">(Privat)</span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEditCategory(category)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteCategory(category.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {editingCategory ? (
            <CategoryDialogForm 
              teamSlug={teamSlug}
              initialData={editingCategory}
              onSuccess={() => {
                setEditingCategory(null);
                onOpenChange(false);
              }}
              onCancel={() => setEditingCategory(null)}
            />
          ) : (
            <CategoryDialogForm 
              teamSlug={teamSlug}
              onSuccess={() => onOpenChange(false)}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
