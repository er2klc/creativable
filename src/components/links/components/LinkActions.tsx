import { Star, StarOff, Trash2, Edit2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { UserLink } from "@/pages/Links";

interface LinkActionsProps {
  link: UserLink;
  onUpdate: () => void;
  onEdit: () => void;
}

export function LinkActions({ link, onUpdate, onEdit }: LinkActionsProps) {
  const { toast } = useToast();
  const { user } = useAuth();

  const toggleFavorite = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to manage links",
        variant: "destructive",
      });
      return;
    }

    const { error } = await supabase
      .from('user_links')
      .update({ 
        is_favorite: !link.is_favorite,
        user_id: user.id 
      })
      .eq('id', link.id);

    if (error) {
      toast({
        title: "Error updating link",
        description: error.message,
        variant: "destructive",
      });
      return;
    }
    onUpdate();
  };

  const deleteLink = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to manage links",
        variant: "destructive",
      });
      return;
    }

    const { error } = await supabase
      .from('user_links')
      .delete()
      .eq('id', link.id)
      .eq('user_id', user.id);

    if (error) {
      toast({
        title: "Error deleting link",
        description: error.message,
        variant: "destructive",
      });
      return;
    }
    onUpdate();
  };

  return (
    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
      <Button
        variant="ghost"
        size="icon"
        onClick={onEdit}
        className="h-8 w-8"
      >
        <Edit2 className="h-4 w-4" />
      </Button>
      
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleFavorite}
        className="h-8 w-8"
      >
        {link.is_favorite ? (
          <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
        ) : (
          <StarOff className="h-4 w-4" />
        )}
      </Button>
      
      <Button
        variant="ghost"
        size="icon"
        onClick={deleteLink}
        className="h-8 w-8 hover:text-destructive"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}