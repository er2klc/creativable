import { useState } from "react";
import { useUser } from "@supabase/auth-helpers-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { UserPlus } from "lucide-react";

interface JoinTeamDialogProps {
  onTeamJoined?: () => void;
}

export const JoinTeamDialog = ({ onTeamJoined }: JoinTeamDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [joinCode, setJoinCode] = useState("");
  const user = useUser();

  const handleJoin = async () => {
    if (!user) {
      toast.error("Sie müssen eingeloggt sein, um einem Team beizutreten");
      return;
    }

    if (!joinCode.trim()) {
      toast.error("Bitte geben Sie einen Beitritts-Code ein");
      return;
    }

    setIsLoading(true);

    try {
      // Find team by join code
      const { data: team, error: teamError } = await supabase
        .from("teams")
        .select("id")
        .eq("join_code", joinCode.trim())
        .single();

      if (teamError || !team) {
        throw new Error("Ungültiger Beitritts-Code");
      }

      // Check if user is already a member
      const { data: existingMember, error: memberCheckError } = await supabase
        .from("team_members")
        .select("id")
        .eq("team_id", team.id)
        .eq("user_id", user.id)
        .single();

      if (existingMember) {
        throw new Error("Sie sind bereits Mitglied dieses Teams");
      }

      // Join team
      const { error: joinError } = await supabase
        .from("team_members")
        .insert({
          team_id: team.id,
          user_id: user.id,
          role: "member",
        });

      if (joinError) throw joinError;

      toast.success("Team erfolgreich beigetreten");
      setIsOpen(false);
      setJoinCode("");
      onTeamJoined?.();
    } catch (error: any) {
      console.error("Error joining team:", error);
      toast.error(error.message || "Fehler beim Beitreten des Teams");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <UserPlus className="h-4 w-4 mr-2" />
          Team beitreten
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Team beitreten</DialogTitle>
          <DialogDescription>
            Geben Sie den Beitritts-Code ein, um einem Team beizutreten.
          </DialogDescription>
        </DialogHeader>
        <div>
          <label htmlFor="joinCode" className="text-sm font-medium">
            Beitritts-Code
          </label>
          <Input
            id="joinCode"
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value)}
            placeholder="Geben Sie den Beitritts-Code ein"
          />
        </div>
        <DialogFooter>
          <Button
            onClick={handleJoin}
            disabled={!joinCode.trim() || isLoading}
          >
            {isLoading ? "Trete bei..." : "Beitreten"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};