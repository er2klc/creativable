import { ArrowLeft, Trash2, LogOut } from "lucide-react";
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
  isOwner: boolean;
}

export function TeamActions({ teamId, isAdmin, isOwner }: TeamActionsProps) {
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
      {isOwner ? (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Trash2 
              className="h-4 w-4 cursor-pointer hover:text-destructive transition-colors"
            />
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Team löschen</AlertDialogTitle>
              <AlertDialogDescription>
                Sind Sie sicher, dass Sie dieses Team löschen möchten? 
                Diese Aktion kann nicht rückgängig gemacht werden.
                Das Team und alle zugehörigen Daten werden permanent gelöscht.
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
      ) : !isAdmin ? (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <LogOut 
              className="h-4 w-4 cursor-pointer hover:text-primary transition-colors"
            />
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Team verlassen</AlertDialogTitle>
              <AlertDialogDescription>
                Sind Sie sicher, dass Sie dieses Team verlassen möchten? 
                Sie können später nur über einen neuen Einladungslink wieder beitreten.
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
      ) : null}
      <ArrowLeft 
        className="h-4 w-4 cursor-pointer hover:text-primary transition-colors"
        onClick={() => navigate('/unity')}
      />
    </div>
  );
}