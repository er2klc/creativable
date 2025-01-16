import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { TeamAccessManager } from "./TeamAccessManager";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { TeamLogoUpload } from "@/components/teams/TeamLogoUpload";
import { RichTextEditor } from "@/components/ui/rich-text-editor";

interface EditPlatformDialogProps {
  platformId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const EditPlatformDialog = ({ platformId, open, onOpenChange }: EditPlatformDialogProps) => {
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedTeams, setSelectedTeams] = useState<string[]>([]);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  const { data: platform } = useQuery({
    queryKey: ['platform', platformId],
    queryFn: async () => {
      const { data: platform, error } = await supabase
        .from('elevate_platforms')
        .select('*')
        .eq('id', platformId)
        .maybeSingle();
      
      if (error) throw error;
      return platform;
    },
    enabled: open,
  });

  // Update form when platform data is loaded
  useEffect(() => {
    if (platform) {
      setName(platform.name || "");
      setDescription(platform.description || "");
      setImageUrl(platform.image_url);
    }
  }, [platform]);

  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      setName("");
      setDescription("");
      setSelectedTeams([]);
      setImageUrl(null);
    }
  }, [open]);

  // Fetch current team access
  useQuery({
    queryKey: ['platform-teams', platformId],
    queryFn: async () => {
      const { data: teamAccess } = await supabase
        .from('elevate_team_access')
        .select('team_id')
        .eq('platform_id', platformId);
      
      if (teamAccess) {
        setSelectedTeams(teamAccess.map(access => access.team_id));
      }
      return teamAccess;
    },
    enabled: open,
  });

  const handleSave = async () => {
    try {
      // Update platform details
      const { error: platformError } = await supabase
        .from('elevate_platforms')
        .update({ 
          name, 
          description,
          image_url: imageUrl
        })
        .eq('id', platformId);

      if (platformError) throw platformError;

      // Get current team access
      const { data: currentAccess } = await supabase
        .from('elevate_team_access')
        .select('team_id')
        .eq('platform_id', platformId);

      const currentTeamIds = currentAccess?.map(access => access.team_id) || [];

      // Remove teams that were unselected
      const teamsToRemove = currentTeamIds.filter(id => !selectedTeams.includes(id));
      if (teamsToRemove.length > 0) {
        const { error: removeError } = await supabase
          .from('elevate_team_access')
          .delete()
          .eq('platform_id', platformId)
          .in('team_id', teamsToRemove);

        if (removeError) throw removeError;
      }

      // Add new team access
      const teamsToAdd = selectedTeams.filter(id => !currentTeamIds.includes(id));
      if (teamsToAdd.length > 0) {
        const { error: addError } = await supabase
          .from('elevate_team_access')
          .insert(
            teamsToAdd.map(teamId => ({
              platform_id: platformId,
              team_id: teamId,
              granted_by: platform?.created_by
            }))
          );

        if (addError) throw addError;
      }

      toast.success("Änderungen gespeichert");
      queryClient.invalidateQueries({ queryKey: ['platforms'] });
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating platform:', error);
      toast.error("Fehler beim Speichern der Änderungen");
    }
  };

  const handleTeamClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]" onClick={handleTeamClick}>
        <DialogHeader>
          <DialogTitle>Plattform bearbeiten</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Name der Plattform"
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
          <TeamAccessManager
            selectedTeams={selectedTeams}
            setSelectedTeams={setSelectedTeams}
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