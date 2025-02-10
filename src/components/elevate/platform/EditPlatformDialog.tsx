
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { TeamAccessManager } from "./TeamAccessManager";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { NameField } from "./edit-dialog/NameField";
import { DescriptionField } from "./edit-dialog/DescriptionField";
import { LogoField } from "./edit-dialog/LogoField";
import { DialogFooter } from "./edit-dialog/DialogFooter";

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
    enabled: open && !!platformId,
  });

  useEffect(() => {
    if (platform) {
      setName(platform.name || "");
      setDescription(platform.description || "");
      setImageUrl(platform.image_url);
    }
  }, [platform]);

  useEffect(() => {
    if (!open) {
      setName("");
      setDescription("");
      setSelectedTeams([]);
      setImageUrl(null);
    }
  }, [open]);

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
    enabled: open && !!platformId,
  });

  const handleSave = async () => {
    try {
      const { error: platformError } = await supabase
        .from('elevate_platforms')
        .update({ 
          name, 
          description,
          image_url: imageUrl
        })
        .eq('id', platformId);

      if (platformError) throw platformError;

      const { data: currentAccess } = await supabase
        .from('elevate_team_access')
        .select('team_id')
        .eq('platform_id', platformId);

      const currentTeamIds = currentAccess?.map(access => access.team_id) || [];

      const teamsToRemove = currentTeamIds.filter(id => !selectedTeams.includes(id));
      if (teamsToRemove.length > 0) {
        const { error: removeError } = await supabase
          .from('elevate_team_access')
          .delete()
          .eq('platform_id', platformId)
          .in('team_id', teamsToRemove);

        if (removeError) throw removeError;
      }

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[725px]">
        <DialogHeader>
          <DialogTitle>Plattform bearbeiten</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <NameField name={name} setName={setName} />
          <DescriptionField description={description} setDescription={setDescription} />
          <LogoField imageUrl={imageUrl} setImageUrl={setImageUrl} />
          <TeamAccessManager
            selectedTeams={selectedTeams}
            setSelectedTeams={setSelectedTeams}
          />
        </div>
        <DialogFooter 
          onSave={handleSave}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
};
