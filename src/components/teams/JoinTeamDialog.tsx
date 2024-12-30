import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useUser } from "@supabase/auth-helpers-react";

interface JoinTeamDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  onTeamJoined?: () => void;
}

export const JoinTeamDialog = ({ isOpen, setIsOpen, onTeamJoined }: JoinTeamDialogProps) => {
  const [joinCode, setJoinCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const user = useUser();

  const handleJoinTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error("Sie müssen eingeloggt sein, um einem Team beizutreten");
      return;
    }

    setIsLoading(true);

    try {
      console.log("Searching for team with join code:", joinCode.trim());
      
      // Find team by join code
      const { data: teams, error: teamError } = await supabase
        .from('teams')
        .select('id, name, created_by')
        .eq('join_code', joinCode.trim())
        .single();

      if (teamError) {
        console.error("Team search error:", teamError);
        throw new Error("Fehler beim Suchen des Teams");
      }
      
      if (!teams) {
        throw new Error("Ungültiger Beitritts-Code");
      }

      // Check if already a member
      const { data: existingMember, error: memberCheckError } = await supabase
        .from('team_members')
        .select('id')
        .eq('team_id', teams.id)
        .eq('user_id', user.id)
        .maybeSingle();

      if (memberCheckError) {
        console.error("Member check error:", memberCheckError);
        throw new Error("Fehler beim Überprüfen der Mitgliedschaft");
      }

      if (existingMember) {
        throw new Error("Sie sind bereits Mitglied dieses Teams");
      }

      // Join team
      const { error: joinError } = await supabase
        .from('team_members')
        .insert({
          team_id: teams.id,
          user_id: user.id,
          role: 'member',
          invited_by: teams.created_by
        });

      if (joinError) {
        console.error("Join error:", joinError);
        throw new Error("Fehler beim Beitreten des Teams");
      }

      toast.success(`Team "${teams.name}" erfolgreich beigetreten`);
      setIsOpen(false);
      setJoinCode("");
      onTeamJoined?.();
    } catch (error) {
      console.error("Join team error:", error);
      toast.error(error instanceof Error ? error.message : "Ein unerwarteter Fehler ist aufgetreten");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Team beitreten</DialogTitle>
          <DialogDescription>
            Geben Sie den Beitritts-Code ein, um einem Team beizutreten
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleJoinTeam} className="space-y-4">
          <Input
            placeholder="Beitritts-Code eingeben"
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value)}
            disabled={isLoading}
          />
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isLoading}
            >
              Abbrechen
            </Button>
            <Button type="submit" disabled={!joinCode.trim() || isLoading}>
              {isLoading ? "Beitritt läuft..." : "Beitreten"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};