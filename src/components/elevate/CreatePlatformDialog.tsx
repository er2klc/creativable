import { useState } from "react";
import { useUser } from "@supabase/auth-helpers-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { CreatePlatformForm } from "./platform/CreatePlatformForm";
import { TeamAccessManager } from "./platform/TeamAccessManager";

interface CreatePlatformDialogProps {
  onPlatformCreated?: () => Promise<void>;
}

export const CreatePlatformDialog = ({ onPlatformCreated }: CreatePlatformDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedTeams, setSelectedTeams] = useState<string[]>([]);
  const [selectedModules, setSelectedModules] = useState<string[]>([]);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const user = useUser();

  const resetState = () => {
    setName("");
    setDescription("");
    setSelectedTeams([]);
    setSelectedModules([]);
    setLogoFile(null);
    setLogoPreview(null);
    setIsLoading(false);
  };

  const handleCreate = async () => {
    if (!user) {
      toast.error("Sie müssen eingeloggt sein, um ein Modul zu erstellen");
      return;
    }

    if (!name.trim()) {
      toast.error("Bitte geben Sie einen Namen ein");
      return;
    }

    setIsLoading(true);

    try {
      let logoUrl = null;

      if (logoFile) {
        const fileExt = logoFile.name.split('.').pop();
        const fileName = `${crypto.randomUUID()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from('team-logos')
          .upload(fileName, logoFile);

        if (uploadError) {
          console.error('Logo upload error:', uploadError);
          throw new Error('Fehler beim Hochladen des Logos');
        }

        const { data: { publicUrl } } = supabase.storage
          .from('team-logos')
          .getPublicUrl(fileName);

        logoUrl = publicUrl;
      }

      const { data: platformData, error: platformError } = await supabase
        .from('elevate_platforms')
        .insert([{
          name: name.trim(),
          description: description.trim() || null,
          created_by: user.id,
          logo_url: logoUrl,
          linked_modules: selectedModules
        }])
        .select()
        .single();

      if (platformError) {
        console.error('Platform creation error:', platformError);
        throw new Error('Fehler beim Erstellen des Moduls');
      }

      if (selectedTeams.length > 0 && platformData) {
        const teamAccess = selectedTeams.map(teamId => ({
          platform_id: platformData.id,
          team_id: teamId,
          granted_by: user.id
        }));

        const { error: accessError } = await supabase
          .from('elevate_team_access')
          .insert(teamAccess);

        if (accessError) {
          console.error('Team access error:', accessError);
          throw new Error('Fehler beim Gewähren des Team-Zugriffs');
        }
      }

      toast.success("Modul erfolgreich erstellt");
      setIsOpen(false);
      resetState();

      if (onPlatformCreated) {
        await onPlatformCreated();
      }
    } catch (error: any) {
      console.error('Fehler beim Erstellen des Moduls:', error);
      toast.error(error.message || 'Unbekannter Fehler beim Erstellen des Moduls');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      resetState();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Modul erstellen
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Neues Ausbildungsmodul erstellen</DialogTitle>
          <DialogDescription>
            Erstellen Sie ein neues Ausbildungsmodul und wählen Sie die Teams aus, die darauf Zugriff haben sollen.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6">
          <CreatePlatformForm
            name={name}
            setName={setName}
            description={description}
            setDescription={setDescription}
            logoFile={logoFile}
            setLogoFile={setLogoFile}
            logoPreview={logoPreview}
            setLogoPreview={setLogoPreview}
            selectedModules={selectedModules}
            setSelectedModules={setSelectedModules}
          />
          <TeamAccessManager
            selectedTeams={selectedTeams}
            setSelectedTeams={setSelectedTeams}
          />
        </div>
        <DialogFooter>
          <Button
            onClick={handleCreate}
            disabled={!name.trim() || isLoading}
          >
            {isLoading ? "Erstelle..." : "Modul erstellen"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};