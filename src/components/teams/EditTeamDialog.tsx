import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { TeamLogoUpload } from "@/components/teams/TeamLogoUpload";
import { RichTextEditor } from "@/components/ui/rich-text-editor";

interface EditTeamDialogProps {
  team: {
    id: string;
    name: string;
    description?: string;
    logo_url?: string;
  };
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTeamUpdated: () => Promise<void>;
}

export const EditTeamDialog = ({ team, open, onOpenChange, onTeamUpdated }: EditTeamDialogProps) => {
  const [name, setName] = useState(team.name);
  const [description, setDescription] = useState(team.description || "");
  const [imageUrl, setImageUrl] = useState<string | null>(team.logo_url || null);

  const handleSave = async () => {
    try {
      const { error } = await supabase
        .from('teams')
        .update({ 
          name, 
          description,
          logo_url: imageUrl
        })
        .eq('id', team.id);

      if (error) throw error;

      toast.success("Team erfolgreich aktualisiert");
      onOpenChange(false);
      await onTeamUpdated();
    } catch (error) {
      console.error('Error updating team:', error);
      toast.error("Fehler beim Aktualisieren des Teams");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Team bearbeiten</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Name des Teams"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Beschreibung</Label>
            <RichTextEditor
              content={description}
              onChange={setDescription}
            />
          </div>
          <TeamLogoUpload
            currentLogoUrl={imageUrl}
            onLogoChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                const reader = new FileReader();
                reader.onloadend = () => {
                  setImageUrl(reader.result as string);
                };
                reader.readAsDataURL(file);
              }
            }}
            onLogoRemove={() => setImageUrl(null)}
          />
        </div>
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Abbrechen
          </Button>
          <Button onClick={handleSave}>
            Speichern
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};