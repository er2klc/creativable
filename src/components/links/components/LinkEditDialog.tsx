import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { UserLink } from "@/pages/Links";

interface LinkEditDialogProps {
  link: UserLink;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: () => void;
}

export function LinkEditDialog({ link, isOpen, onOpenChange, onUpdate }: LinkEditDialogProps) {
  const [editedTitle, setEditedTitle] = useState(link.title);
  const [editedUrl, setEditedUrl] = useState(link.url);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleSave = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to manage links",
        variant: "destructive",
      });
      return;
    }

    const { data, error } = await supabase
      .from('user_links')
      .update({ 
        title: editedTitle,
        url: editedUrl,
        user_id: user.id 
      })
      .eq('id', link.id)
      .select()
      .single();

    if (error) {
      toast({
        title: "Error updating link",
        description: error.message,
        variant: "destructive",
      });
      return;
    }
    
    onOpenChange(false);
    onUpdate();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Link bearbeiten</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Input
              placeholder="Title"
              value={editedTitle}
              onChange={(e) => setEditedTitle(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Input
              placeholder="URL"
              value={editedUrl}
              onChange={(e) => setEditedUrl(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Abbrechen
          </Button>
          <Button onClick={handleSave}>
            Speichern
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}