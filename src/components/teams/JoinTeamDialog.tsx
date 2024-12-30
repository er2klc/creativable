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
      const cleanJoinCode = joinCode.trim().toUpperCase();
      
      // First, let's check if the team exists
      const { data: team, error: searchError } = await supabase
        .from('teams')
        .select('*')
        .eq('join_code', cleanJoinCode)
        .single();

      if (searchError || !team) {
        toast.error("Ungültiger Beitritts-Code");
        setIsLoading(false);
        return;
      }

      // Check if already a member
      const { data: existingMember, error: memberCheckError } = await supabase
        .from('team_members')
        .select('id')
        .eq('team_id', team.id)
        .eq('user_id', user.id)
        .single();

      if (existingMember) {
        toast.error("Sie sind bereits Mitglied dieses Teams");
        setIsLoading(false);
        return;
      }

      // Join team
      const { error: joinError } = await supabase
        .from('team_members')
        .insert({
          team_id: team.id,
          user_id: user.id,
          role: 'member'
        });

      if (joinError) throw joinError;

      toast.success(`Team "${team.name}" erfolgreich beigetreten`);
      setIsOpen(false);
      setJoinCode("");
      onTeamJoined?.();
    } catch (error: any) {
      console.error("Join team error:", error);
      toast.error("Fehler beim Beitreten des Teams");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setJoinCode("");
    setIsLoading(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
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
              onClick={handleClose}
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