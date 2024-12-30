import { Crown, LogOut, Trash2, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
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
import { useSession } from "@supabase/auth-helpers-react";

interface TeamCardActionsProps {
  teamId: string;
  isOwner: boolean;
  joinCode?: string;
  onDelete: () => void;
  onLeave: () => void;
  onCopyJoinCode: (code: string, e?: React.MouseEvent) => void;
}

export const TeamCardActions = ({
  teamId,
  isOwner,
  joinCode,
  onDelete,
  onLeave,
  onCopyJoinCode,
}: TeamCardActionsProps) => {
  const session = useSession();

  const { data: teamMember } = useQuery({
    queryKey: ["team-member", teamId, session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return null;
      
      const { data, error } = await supabase
        .from("team_members")
        .select("id, role")
        .eq("team_id", teamId)
        .eq("user_id", session.user.id)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!session?.user?.id && !!teamId,
  });

  const isMember = !!teamMember;

  return (
    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
      {isOwner && (
        <Crown className="h-4 w-4 text-yellow-500" />
      )}
      {joinCode && (
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => {
            e.stopPropagation();
            onCopyJoinCode(joinCode, e);
          }}
          className="h-8 w-8"
          title="Code kopieren"
        >
          <Copy className="h-4 w-4" />
        </Button>
      )}
      {isMember && !isOwner ? (
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => {
            e.stopPropagation();
            onLeave();
          }}
          className="h-8 w-8 text-destructive hover:text-destructive"
          title="Team verlassen"
        >
          <LogOut className="h-4 w-4" />
        </Button>
      ) : isOwner && (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive hover:text-destructive"
              title="Team löschen"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent onClick={(e) => e.stopPropagation()}>
            <AlertDialogHeader>
              <AlertDialogTitle>Team löschen</AlertDialogTitle>
              <AlertDialogDescription>
                Sind Sie sicher, dass Sie dieses Team löschen möchten? Diese Aktion kann nicht rückgängig gemacht werden.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Abbrechen</AlertDialogCancel>
              <AlertDialogAction onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}>
                Löschen
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
};