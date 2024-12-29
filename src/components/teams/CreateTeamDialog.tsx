import { useState } from "react";
import { useUser } from "@supabase/auth-helpers-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus, Copy } from "lucide-react";

interface CreateTeamDialogProps {
  onTeamCreated?: () => void;
}

export const CreateTeamDialog = ({ onTeamCreated }: CreateTeamDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [joinCode, setJoinCode] = useState<string | null>(null);
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
      const teamData = {
        name: name.trim(),
        description: description.trim(),
        created_by: user.id,
      };

      const { data: team, error: teamError } = await supabase
        .from("teams")
        .insert(teamData)
        .select('*, team_members(*)')
        .single();

      if (teamError) throw teamError;

      if (!team) {
        throw new Error("Team wurde erstellt, aber keine Daten zurückgegeben");
      }

      const { error: memberError } = await supabase
        .from("team_members")
        .insert({
          team_id: team.id,
          user_id: user.id,
          role: "owner",
        });

      if (memberError) throw memberError;

      setJoinCode(team.join_code);
      toast.success("Team erfolgreich erstellt");
      onTeamCreated?.();
    } catch (error: any) {
      console.error("Error creating team:", error);
      toast.error(error.message || "Fehler beim Erstellen des Teams");
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
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Neues Team erstellen</DialogTitle>
          <DialogDescription>
            Erstellen Sie ein neues Team und laden Sie Mitglieder ein.
          </DialogDescription>
        </DialogHeader>
        {!joinCode ? (
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