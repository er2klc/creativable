
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { TeamLogoUpload } from "./TeamLogoUpload";
import { TiptapEditor } from "@/components/ui/tiptap-editor";

interface EditTeamDialogProps {
  team: {
    id: string;
    name: string;
    description?: string;
    logo_url?: string;
    video_url?: string;
  };
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTeamUpdated: () => Promise<void>;
}

const MAX_DESCRIPTION_LENGTH = 300;

export const EditTeamDialog = ({ team, open, onOpenChange, onTeamUpdated }: EditTeamDialogProps) => {
  const [name, setName] = useState(team.name);
  const [description, setDescription] = useState(team.description || "");
  const [imageUrl, setImageUrl] = useState<string | null>(team.logo_url || null);
  const [videoUrl, setVideoUrl] = useState(team.video_url || "");
  const [descriptionLength, setDescriptionLength] = useState(
    team.description?.replace(/<[^>]*>/g, '').length || 0
  );

  const handleDescriptionChange = (content: string) => {
    const textLength = content.replace(/<[^>]*>/g, '').length;
    setDescriptionLength(textLength);
    setDescription(content);
  };

  const handleSave = async () => {
    if (descriptionLength > MAX_DESCRIPTION_LENGTH) {
      toast.error(`Beschreibung darf maximal ${MAX_DESCRIPTION_LENGTH} Zeichen enthalten`);
      return;
    }

    try {
      const { error } = await supabase
        .from('teams')
        .update({ 
          name, 
          description,
          logo_url: imageUrl,
          video_url: videoUrl
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
      <DialogContent className="sm:max-w-[600px] w-[95vw] max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Team bearbeiten</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4 overflow-y-auto px-1">
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
            <div className="flex justify-between items-center text-sm mb-1">
              <Label htmlFor="description">Beschreibung</Label>
              <span className={`${descriptionLength > MAX_DESCRIPTION_LENGTH ? "text-red-500" : "text-gray-500"}`}>
                {descriptionLength}/{MAX_DESCRIPTION_LENGTH}
              </span>
            </div>
            <div className="border rounded-md min-h-[200px]">
              <TiptapEditor
                content={description}
                onChange={handleDescriptionChange}
                preventSubmitOnEnter
              />
            </div>
            {descriptionLength > MAX_DESCRIPTION_LENGTH && (
              <p className="text-xs text-red-500 mt-1">
                Die Beschreibung ist zu lang. Bitte kürzen Sie sie auf maximal {MAX_DESCRIPTION_LENGTH} Zeichen.
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="videoUrl">Video URL (optional)</Label>
            <Input
              id="videoUrl"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="Fügen Sie eine Video-URL hinzu"
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
        <div className="flex justify-end gap-3 pt-4 border-t mt-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Abbrechen
          </Button>
          <Button 
            onClick={handleSave}
            disabled={descriptionLength > MAX_DESCRIPTION_LENGTH}
          >
            Speichern
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
