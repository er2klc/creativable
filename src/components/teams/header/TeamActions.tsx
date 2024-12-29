import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface TeamActionsProps {
  teamId: string;
  isAdmin: boolean;
}

export function TeamActions({ teamId, isAdmin }: TeamActionsProps) {
  const navigate = useNavigate();

  const handleLeaveTeam = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Nicht eingeloggt");

      const { error } = await supabase
        .from('team_members')
        .delete()
        .match({ 
          team_id: teamId,
          user_id: user.id 
        });

      if (error) throw error;

      toast.success("Team erfolgreich verlassen");
      navigate('/unity');
    } catch (error: any) {
      console.error('Error leaving team:', error);
      toast.error("Fehler beim Verlassen des Teams");
    }
  };

  const handleDeleteTeam = async () => {
    try {
      const { error } = await supabase
        .from('teams')
        .delete()
        .eq('id', teamId);

      if (error) throw error;

      toast.success("Team erfolgreich gelöscht");
      navigate('/unity');
    } catch (error: any) {
      console.error('Error deleting team:', error);
      toast.error("Fehler beim Löschen des Teams");
    }
  };

  return (
    <div className="flex items-center gap-2">
      {isAdmin ? (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="outline"
              className="text-sm text-destructive hover:bg-destructive/10"
            >
              Team löschen
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Team löschen</AlertDialogTitle>
              <AlertDialogDescription>
                Sind Sie sicher, dass Sie dieses Team löschen möchten? 
                Diese Aktion kann nicht rückgängig gemacht werden.
                Alle Teammitglieder werden entfernt.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Abbrechen</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteTeam}
                className="bg-destructive hover:bg-destructive/90"
              >
                Löschen
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      ) : (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="outline"
              className="text-sm text-destructive hover:bg-destructive/10"
            >
              Team verlassen
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Team verlassen</AlertDialogTitle>
              <AlertDialogDescription>
                Sind Sie sicher, dass Sie dieses Team verlassen möchten? 
                Diese Aktion kann nicht rückgängig gemacht werden.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Abbrechen</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleLeaveTeam}
                className="bg-destructive hover:bg-destructive/90"
              >
                Verlassen
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
      <Button
        variant="ghost"
        onClick={() => navigate('/unity')}
        className="text-sm text-muted-foreground hover:text-primary transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
      </Button>
    </div>
  );
}