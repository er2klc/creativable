
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const useFavorite = () => {
  const queryClient = useQueryClient();

  const toggleFavorite = async (id: string, currentFavoriteStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('leads')
        .update({ is_favorite: !currentFavoriteStatus })
        .eq('id', id);

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ["pool-leads"] });
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      
      toast.success(currentFavoriteStatus ? "Von Favoriten entfernt" : "Zu Favoriten hinzugefügt");
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast.error("Fehler beim Aktualisieren des Favoriten-Status");
    }
  };

  return { toggleFavorite };
};
