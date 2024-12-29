import { Team } from "@/integrations/supabase/types/teams";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Copy, Trash2, Users, Crown, ChevronRight, Image } from "lucide-react";
import { useUser } from "@supabase/auth-helpers-react";
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
import { useNavigate } from "react-router-dom";

interface TeamCardProps {
  team: Team;
  teamStats?: {
    totalMembers: number;
    admins: number;
  };
  onDelete: (teamId: string) => Promise<void>;
}

export const TeamCard = ({ team, teamStats, onDelete }: TeamCardProps) => {
  const user = useUser();
  const navigate = useNavigate();

  const copyJoinCode = async (joinCode: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    await navigator.clipboard.writeText(joinCode);
    toast.success("Beitritts-Code kopiert!");
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await onDelete(team.id);
      toast.success("Team erfolgreich gelöscht");
    } catch (error) {
      console.error('Error in TeamCard delete:', error);
      toast.error("Fehler beim Löschen des Teams");
    }
  };

  // Only the team creator (owner) can delete the team
  const isOwner = team.created_by === user?.id;

  return (
    <Card 
      className="cursor-pointer hover:shadow-lg transition-all duration-300 group"
      onClick={() => navigate(`/unity/team/${team.id}`)}
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
          <div className="flex gap-2">
            {team.join_code && (
              <Button
                size="icon"
                variant="ghost"
                onClick={(e) => copyJoinCode(team.join_code!, e)}
                className="h-8 w-8"
              >
                <Copy className="h-4 w-4" />
              </Button>
            )}
            {isOwner && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent onClick={(e) => e.stopPropagation()}>
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
                      onClick={handleDelete}
                      className="bg-destructive hover:bg-destructive/90"
                    >
                      Löschen
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
    </Card>
  );
};