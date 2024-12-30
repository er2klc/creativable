import { useState } from "react";
import { useUser } from "@supabase/auth-helpers-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { CreateTeamForm } from "./create-team/CreateTeamForm";
import { JoinCodeDisplay } from "./create-team/JoinCodeDisplay";

interface CreateTeamDialogProps {
  onTeamCreated?: () => void;
}

export const CreateTeamDialog = ({ onTeamCreated }: CreateTeamDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [joinCode, setJoinCode] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const user = useUser();

  const handleCreate = async () => {
    if (!user) {
      toast.error("Sie müssen eingeloggt sein, um ein Team zu erstellen");
      return;
    }

    if (!name.trim()) {
      toast.error("Bitte geben Sie einen Team-Namen ein");
      return;
    }

    setIsLoading(true);

    try {
      const { data: team, error: teamError } = await supabase
        .from('teams')
        .insert({
          name: name.trim(),
          description: description.trim() || null,
          created_by: user.id,
        })
        .select()
        .single();

      if (teamError) throw teamError;

      const { error: memberError } = await supabase
        .from('team_members')
        .insert({
          team_id: team.id,
          user_id: user.id,
          role: 'owner',
        });

      if (memberError) throw memberError;

      if (logoFile && team.id) {
        const fileExt = logoFile.name.split('.').pop();
        const fileName = `${team.id}-logo.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('team-logos')
          .upload(fileName, logoFile, { upsert: true });

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('team-logos')
          .getPublicUrl(fileName);

        const { error: updateError } = await supabase
          .from('teams')
          .update({ logo_url: publicUrl })
          .eq('id', team.id);

        if (updateError) throw updateError;
      }

      setJoinCode(team.join_code);
      onTeamCreated?.();
      toast.success("Team erfolgreich erstellt");
    } catch (error: any) {
      console.error('Error creating team:', error);
      toast.error("Fehler beim Erstellen des Teams");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      setName("");
      setDescription("");
      setJoinCode(null);
      setLogoFile(null);
      setLogoPreview(null);
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Team erstellen
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Neues Team erstellen</DialogTitle>
          <DialogDescription>
            Erstellen Sie ein neues Team und laden Sie Mitglieder ein.
          </DialogDescription>
        </DialogHeader>
        {!joinCode ? (
          <>
            <CreateTeamForm
              name={name}
              setName={setName}
              description={description}
              setDescription={setDescription}
              logoFile={logoFile}
              setLogoFile={setLogoFile}
              logoPreview={logoPreview}
              setLogoPreview={setLogoPreview}
            />
            <DialogFooter>
              <Button
                onClick={handleCreate}
                disabled={!name.trim() || isLoading}
              >
                {isLoading ? "Erstelle..." : "Team erstellen"}
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <JoinCodeDisplay joinCode={joinCode} />
            <DialogFooter>
              <Button onClick={() => handleOpenChange(false)}>
                Schließen
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};