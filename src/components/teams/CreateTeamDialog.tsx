import { useState } from "react";
import { useUser } from "@supabase/auth-helpers-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus } from "lucide-react";

interface CreateTeamDialogProps {
  onTeamCreated?: () => void;
}

export const CreateTeamDialog = ({ onTeamCreated }: CreateTeamDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
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

    try {
      setIsLoading(true);

      // First, create the team
      const { data: team, error: teamError } = await supabase
        .from("teams")
        .insert({
          name: name.trim(),
          description: description.trim(),
          created_by: user.id,
        })
        .select('*')
        .throwOnError()
        .single();

      if (teamError) throw teamError;

      // Then, create the team member entry for the creator as owner
      const { error: memberError } = await supabase
        .from("team_members")
        .insert({
          team_id: team.id,
          user_id: user.id,
          role: "owner",
        })
        .throwOnError();

      if (memberError) throw memberError;

      toast.success("Team erfolgreich erstellt");
      setIsOpen(false);
      setName("");
      setDescription("");
      onTeamCreated?.();
    } catch (error: any) {
      console.error("Error creating team:", error);
      toast.error(`Fehler beim Erstellen des Teams: ${error.message || "Unbekannter Fehler"}`);
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
        <div className="space-y-4">
          <div>
            <label htmlFor="name" className="text-sm font-medium">
              Team Name
            </label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Geben Sie einen Team-Namen ein"
            />
          </div>
          <div>
            <label htmlFor="description" className="text-sm font-medium">
              Beschreibung
            </label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Beschreiben Sie Ihr Team (optional)"
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            onClick={handleCreate}
            disabled={!name.trim() || isLoading}
          >
            {isLoading ? "Erstelle..." : "Team erstellen"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};