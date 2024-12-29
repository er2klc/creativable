import { useState } from "react";
import { useUser } from "@supabase/auth-helpers-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { UserPlus } from "lucide-react";

interface InviteTeamMemberDialogProps {
  teamId: string;
  onInviteSent?: () => void;
}

export const InviteTeamMemberDialog = ({ teamId, onInviteSent }: InviteTeamMemberDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const user = useUser();

  const handleInvite = async () => {
    if (!user) {
      toast.error("Sie müssen eingeloggt sein, um Mitglieder einzuladen");
      return;
    }

    if (!email.trim()) {
      toast.error("Bitte geben Sie eine E-Mail-Adresse ein");
      return;
    }
    
    try {
      setIsLoading(true);

      const { error } = await supabase
        .from("team_invites")
        .insert({
          team_id: teamId,
          email: email.trim(),
          invited_by: user.id,
        });

      if (error) throw error;

      toast.success("Einladung erfolgreich gesendet");
      setIsOpen(false);
      setEmail("");
      onInviteSent?.();
    } catch (error: any) {
      console.error("Error sending invite:", error);
      toast.error("Fehler beim Senden der Einladung");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <UserPlus className="h-4 w-4 mr-2" />
          Mitglied einladen
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Team-Mitglied einladen</DialogTitle>
          <DialogDescription>
            Laden Sie neue Mitglieder per E-Mail ein.
          </DialogDescription>
        </DialogHeader>
        <div>
          <label htmlFor="email" className="text-sm font-medium">
            E-Mail-Adresse
          </label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="beispiel@email.com"
          />
        </div>
        <DialogFooter>
          <Button
            onClick={handleInvite}
            disabled={!email.trim() || isLoading}
          >
            {isLoading ? "Sende..." : "Einladung senden"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};