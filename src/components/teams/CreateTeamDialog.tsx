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
import { useTeamCreation } from "./hooks/useTeamCreation";
import { TeamLogoUpload } from "./TeamLogoUpload";

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
  
  const { isLoading, handleCreate } = useTeamCreation({
    onSuccess: (code) => {
      setJoinCode(code);
      onTeamCreated?.();
    },
    onError: (error) => {
      toast.error(error.message || "Fehler beim Erstellen des Teams");
    }
  });

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

  const copyJoinCode = async () => {
    if (joinCode) {
      await navigator.clipboard.writeText(joinCode);
      toast.success("Beitritts-Code kopiert!");
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
    }
  };

  const handleSubmit = async () => {
    await handleCreate({
      name,
      description,
      logoFile
    });
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

            <TeamLogoUpload
              logoPreview={logoPreview}
              onLogoChange={handleLogoChange}
              onLogoRemove={() => {
                setLogoFile(null);
                setLogoPreview(null);
              }}
            />
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
              onClick={handleSubmit}
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