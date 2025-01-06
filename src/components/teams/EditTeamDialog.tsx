import { useState } from "react";
import { useUser } from "@supabase/auth-helpers-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { TeamLogoUpload } from "./TeamLogoUpload";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { type Tables } from "@/integrations/supabase/types";

interface EditTeamDialogProps {
  team: Tables<"teams">;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTeamUpdated: () => Promise<void>;
}

export const EditTeamDialog = ({ team, open, onOpenChange, onTeamUpdated }: EditTeamDialogProps) => {
  const [name, setName] = useState(team.name);
  const [description, setDescription] = useState(team.description || "");
  const [videoUrl, setVideoUrl] = useState(team.video_url || "");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(team.logo_url);
  const [isLoading, setIsLoading] = useState(false);
  const user = useUser();

  const handleSave = async () => {
    if (!user) return;

    setIsLoading(true);

    try {
      let logoUrl = team.logo_url;

      if (logoFile) {
        const fileExt = logoFile.name.split('.').pop();
        const fileName = `${crypto.randomUUID()}.${fileExt}`;

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('team-logos')
          .upload(fileName, logoFile, {
            upsert: true,
            contentType: logoFile.type
          });

        if (uploadError) throw uploadError;

        const { data } = supabase.storage
          .from('team-logos')
          .getPublicUrl(fileName);

        logoUrl = data.publicUrl;
      }

      const { error: updateError } = await supabase
        .from('teams')
        .update({
          name: name.trim(),
          description: description.trim() || null,
          video_url: videoUrl.trim() || null,
          logo_url: logoUrl,
        })
        .eq('id', team.id);

      if (updateError) throw updateError;

      await onTeamUpdated();
      toast.success("Team erfolgreich aktualisiert");
      onOpenChange(false);
    } catch (error: any) {
      console.error('Error updating team:', error);
      toast.error("Fehler beim Aktualisieren des Teams: " + (error.message || 'Unbekannter Fehler'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Team bearbeiten</DialogTitle>
          <DialogDescription>
            Aktualisieren Sie die Informationen Ihres Teams.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Team Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Geben Sie einen Team-Namen ein"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Beschreibung</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Beschreiben Sie Ihr Team (optional)"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="videoUrl">Team Video URL (optional)</Label>
            <Input
              id="videoUrl"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="Fügen Sie eine Video-URL hinzu"
            />
          </div>
          <div className="space-y-2">
            <Label>Team Foto</Label>
            <TeamLogoUpload
              logoPreview={logoPreview}
              onLogoChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                setLogoFile(file);
                const reader = new FileReader();
                reader.onloadend = () => {
                  setLogoPreview(reader.result as string);
                };
                reader.readAsDataURL(file);
              }}
              onLogoRemove={() => {
                setLogoFile(null);
                setLogoPreview(null);
              }}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Abbrechen
          </Button>
          <Button onClick={handleSave} disabled={!name.trim() || isLoading}>
            {isLoading ? "Speichern..." : "Speichern"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};