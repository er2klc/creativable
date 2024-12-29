import { useState } from "react";
import { useUser } from "@supabase/auth-helpers-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus, Copy, Upload, Image } from "lucide-react";
import { Label } from "@/components/ui/label";

interface CreateTeamDialogProps {
  onTeamCreated?: () => void;
}

export const CreateTeamDialog = ({ onTeamCreated }: CreateTeamDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [joinCode, setJoinCode] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const user = useUser();

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadLogo = async (teamId: string): Promise<string | null> => {
    if (!logoFile) return null;

    const fileExt = logoFile.name.split('.').pop();
    const filePath = `${teamId}/logo.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('team-logos')
      .upload(filePath, logoFile);

    if (uploadError) {
      console.error("Error uploading logo:", uploadError);
      throw uploadError;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('team-logos')
      .getPublicUrl(filePath);

    return publicUrl;
  };

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
        .from("teams")
        .insert({
          name: name.trim(),
          description: description.trim(),
          created_by: user.id,
        })
        .select('id, name, join_code')
        .single();

      if (teamError) {
        console.error("Error inserting team:", teamError);
        throw teamError;
      }

      if (!team) {
        throw new Error("Team wurde erstellt, aber keine Daten zurückgegeben");
      }

      let logoUrl = null;
      if (logoFile) {
        logoUrl = await uploadLogo(team.id);
        const { error: updateError } = await supabase
          .from("teams")
          .update({ logo_url: logoUrl })
          .eq('id', team.id);

        if (updateError) {
          console.error("Error updating team logo:", updateError);
          throw updateError;
        }
      }

      const { error: memberError } = await supabase
        .from("team_members")
        .insert({
          team_id: team.id,
          user_id: user.id,
          role: "owner",
        });

      if (memberError) {
        console.error("Error creating team member:", memberError);
        throw memberError;
      }

      setJoinCode(team.join_code);
      toast.success("Team erfolgreich erstellt");
      onTeamCreated?.();
    } catch (error: any) {
      console.error("Error creating team:", error);
      toast.error(error.message || "Fehler beim Erstellen des Teams");
      if (error.hint) console.error("Policy hint:", error.hint);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      setIsLoading(false);
      setName("");
      setDescription("");
      setJoinCode(null);
      setLogoFile(null);
      setLogoPreview(null);
    }
  };

  const copyJoinCode = async () => {
    if (joinCode) {
      await navigator.clipboard.writeText(joinCode);
      toast.success("Beitritts-Code kopiert!");
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
          <div className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Team Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Geben Sie einen Team-Namen ein"
                />
              </div>
              <div>
                <Label htmlFor="description">Beschreibung</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Beschreiben Sie Ihr Team (optional)"
                />
              </div>
            </div>

            <div className="space-y-4">
              <Label>Team Logo</Label>
              <div className="flex flex-col items-center gap-4">
                {logoPreview ? (
                  <div className="relative w-32 h-32 rounded-full overflow-hidden border-2 border-primary/20">
                    <img
                      src={logoPreview}
                      alt="Team logo preview"
                      className="w-full h-full object-cover"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-0 right-0 bg-background/80 hover:bg-background"
                      onClick={() => {
                        setLogoFile(null);
                        setLogoPreview(null);
                      }}
                    >
                      ×
                    </Button>
                  </div>
                ) : (
                  <div className="w-32 h-32 rounded-full border-2 border-dashed border-primary/20 flex items-center justify-center">
                    <Image className="w-12 h-12 text-muted-foreground" />
                  </div>
                )}
                <div className="flex justify-center">
                  <Label
                    htmlFor="logo-upload"
                    className="cursor-pointer inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Logo hochladen
                    <Input
                      id="logo-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleLogoChange}
                    />
                  </Label>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm font-medium mb-2">Team Beitritts-Code:</p>
              <div className="flex items-center gap-2">
                <code className="bg-background p-2 rounded flex-1">{joinCode}</code>
                <Button size="icon" variant="outline" onClick={copyJoinCode}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Teilen Sie diesen Code mit Ihren Teammitgliedern, damit sie beitreten können.
              </p>
            </div>
          </div>
        )}
        <DialogFooter>
          {!joinCode ? (
            <Button
              onClick={handleCreate}
              disabled={!name.trim() || isLoading}
            >
              {isLoading ? "Erstelle..." : "Team erstellen"}
            </Button>
          ) : (
            <Button onClick={() => handleOpenChange(false)}>
              Schließen
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};