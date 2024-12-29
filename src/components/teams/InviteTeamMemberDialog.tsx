import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useUser } from "@supabase/auth-helpers-react";
import { UserPlus } from "lucide-react";

interface InviteTeamMemberDialogProps {
  teamId: string;
  onInviteSent?: () => void;
}

export const InviteTeamMemberDialog = ({ teamId, onInviteSent }: InviteTeamMemberDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const user = useUser();

  const handleInvite = async () => {
    if (!user) {
      toast.error("Sie müssen eingeloggt sein, um Mitglieder einzuladen");
      return;
    }
    
    try {
      setIsLoading(true);
      
      const { error } = await supabase
        .from('team_invites')
        .insert({
          team_id: teamId,
          email: email.toLowerCase(),
          invited_by: user.id,
        });

      if (error) throw error;

      toast.success("Einladung wurde erfolgreich versendet");
      setIsOpen(false);
      setEmail("");
      onInviteSent?.();
    } catch (error: any) {
      console.error("Error sending invite:", error);
      toast.error(error.message || "Fehler beim Versenden der Einladung");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <UserPlus className="h-4 w-4 mr-2" />
          Mitglied einladen
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Neues Teammitglied einladen</DialogTitle>
          <DialogDescription>
            Senden Sie eine Einladung an die E-Mail-Adresse des neuen Teammitglieds.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="email">E-Mail-Adresse</Label>
            <Input
              id="email"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
            onClick={handleInvite}
            disabled={!email || isLoading}
          >
            {isLoading ? "Sende..." : "Einladung senden"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};