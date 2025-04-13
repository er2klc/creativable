import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface DeleteUnitButtonProps {
  lerninhalteId: string;
  onDelete: () => void;
}

export const DeleteUnitButton = ({ lerninhalteId, onDelete }: DeleteUnitButtonProps) => {
  const handleDelete = async () => {
    try {
      const { error } = await supabase
        .from('elevate_lerninhalte')
        .delete()
        .eq('id', lerninhalteId);

      if (error) throw error;

      toast.success("Lerneinheit erfolgreich gelöscht");
      onDelete();
    } catch (error) {
      console.error('Error deleting learning unit:', error);
      toast.error("Fehler beim Löschen der Lerneinheit");
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleDelete}
      className="text-destructive hover:text-destructive/90 hover:bg-destructive/10"
    >
      <Trash2 className="h-4 w-4" />
    </Button>
  );
};