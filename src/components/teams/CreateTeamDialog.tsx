import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useUser } from "@supabase/auth-helpers-react";
import { Plus } from "lucide-react";

interface CreateTeamDialogProps {
  onTeamCreated?: () => void;
}

export const CreateTeamDialog = ({ onTeamCreated }: CreateTeamDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const user = useUser();

  const handleCreate = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      
      const { error } = await supabase
        .from('teams')
        .insert({
          name,
          description,
          created_by: user.id,
        });

      if (error) throw error;

      toast.success("Team wurde erfolgreich erstellt");
      setIsOpen(false);
      setName("");
      setDescription("");
      onTeamCreated?.();
    } catch (error: any) {
      console.error("Error creating team:", error);
      toast.error(error.message || "Fehler beim Erstellen des Teams");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Team erstellen
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Neues Team erstellen</DialogTitle>
          <DialogDescription>
            Erstellen Sie ein neues Team und laden Sie Mitglieder ein.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Team Name</Label>
            <Input
              id="name"
              placeholder="Mein Team"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Beschreibung</Label>
            <Textarea
              id="description"
              placeholder="Beschreiben Sie Ihr Team..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setIsOpen(false)}
            disabled={isLoading}
          >
            Abbrechen
          </Button>
          <Button
            onClick={handleCreate}
            disabled={!name || isLoading}
          >
            Team erstellen
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};