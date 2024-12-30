import { Team } from "@/integrations/supabase/types";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Crown, Image } from "lucide-react";
import { useUser } from "@supabase/auth-helpers-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { TeamCardActions } from "./card/TeamCardActions";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useState } from "react";

interface TeamCardProps {
  team: Team;
  teamStats?: {
    totalMembers: number;
    admins: number;
  };
  onDelete: (teamId: string) => Promise<void>;
  onLeave: (teamId: string) => Promise<void>;
}

export const TeamCard = ({ team, teamStats, onDelete, onLeave }: TeamCardProps) => {
  const user = useUser();
  const navigate = useNavigate();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showLeaveDialog, setShowLeaveDialog] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const copyJoinCode = async (joinCode: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    await navigator.clipboard.writeText(joinCode);
    toast.success("Beitritts-Code kopiert!");
  };

  const handleDelete = async () => {
    if (!user || isProcessing) return;
    
    setIsProcessing(true);
    try {
      await onDelete(team.id);
      setShowDeleteDialog(false);
    } catch (error: any) {
      console.error('Error deleting team:', error);
      toast.error("Fehler beim Löschen des Teams");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleLeave = async () => {
    if (!user || isProcessing) return;

    setIsProcessing(true);
    try {
      await onLeave(team.id);
      setShowLeaveDialog(false);
    } catch (error) {
      console.error('Error leaving team:', error);
      toast.error("Fehler beim Verlassen des Teams");
    } finally {
      setIsProcessing(false);
    }
  };

  const isOwner = team.created_by === user?.id;

  return (
    <>
      <Card 
        className="cursor-pointer hover:shadow-lg transition-all duration-300 group relative"
        onClick={() => navigate(`/unity/team/${team.slug}`)}
      >
        <CardHeader className="space-y-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-6">
              <div className="relative group/logo">
                {team.logo_url ? (
                  <div className="w-24 h-24 rounded-xl overflow-hidden border border-border">
                    <img 
                      src={team.logo_url} 
                      alt={team.name}
                      className="w-full h-full object-cover transition-transform group-hover/logo:scale-110"
                    />
                  </div>
                ) : (
                  <div className="w-24 h-24 rounded-xl border border-border bg-primary/5 flex items-center justify-center">
                    <Image className="w-12 h-12 text-primary/40" />
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <CardTitle className="group-hover:text-primary transition-colors text-2xl">
                  {team.name}
                </CardTitle>
                <CardDescription className="text-base">
                  {team.description || 'Keine Beschreibung verfügbar'}
                </CardDescription>
                <div className="flex flex-wrap items-center gap-2 pt-2">
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    {teamStats?.totalMembers || 0} Mitglieder
                  </Badge>
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <Crown className="h-3 w-3" />
                    {teamStats?.admins || 0} Admins
                  </Badge>
                  {isOwner && (
                    <Badge variant="default" className="flex items-center gap-1">
                      <Crown className="h-3 w-3" />
                      Team Owner
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            <TeamCardActions
              teamId={team.id}
              userId={user?.id}
              isOwner={isOwner}
              joinCode={team.join_code}
              onDelete={() => setShowDeleteDialog(true)}
              onLeave={() => setShowLeaveDialog(true)}
              onCopyJoinCode={copyJoinCode}
            />
          </div>
        </CardHeader>
      </Card>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Team löschen</AlertDialogTitle>
            <AlertDialogDescription>
              Sind Sie sicher, dass Sie dieses Team löschen möchten? Diese Aktion kann nicht rückgängig gemacht werden.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isProcessing}>Abbrechen</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete} 
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isProcessing}
            >
              {isProcessing ? 'Wird gelöscht...' : 'Löschen'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showLeaveDialog} onOpenChange={setShowLeaveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Team verlassen</AlertDialogTitle>
            <AlertDialogDescription>
              Sind Sie sicher, dass Sie dieses Team verlassen möchten?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isProcessing}>Abbrechen</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleLeave}
              disabled={isProcessing}
            >
              {isProcessing ? 'Wird verlassen...' : 'Verlassen'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};