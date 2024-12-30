import { Team } from "@/integrations/supabase/types/teams";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Copy, Trash2, Users, Crown, ChevronRight, Image, LogOut } from "lucide-react";
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
import { supabase } from "@/integrations/supabase/client";

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

  const copyJoinCode = async (joinCode: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    await navigator.clipboard.writeText(joinCode);
    toast.success("Beitritts-Code kopiert!");
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const { error } = await supabase
        .from('teams')
        .delete()
        .eq('id', team.id);

      if (error) throw error;
      
      await onDelete(team.id);
      toast.success("Team erfolgreich gelöscht");
    } catch (error) {
      console.error('Error in TeamCard delete:', error);
      toast.error("Fehler beim Löschen des Teams");
    }
  };

  const handleLeave = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      if (!user?.id) throw new Error("Not authenticated");

      const { error } = await supabase
        .from('team_members')
        .delete()
        .match({ 
          team_id: team.id,
          user_id: user.id 
        });

      if (error) throw error;

      await onLeave(team.id);
      toast.success("Team erfolgreich verlassen");
    } catch (error) {
      console.error('Error in TeamCard leave:', error);
      toast.error("Fehler beim Verlassen des Teams");
    }
  };

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
              <Copy
                className="h-4 w-4 cursor-pointer hover:text-primary transition-colors"
                onClick={(e) => copyJoinCode(team.join_code!, e)}
              />
            )}
            {isOwner ? (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Trash2 
                    className="h-4 w-4 cursor-pointer text-destructive hover:text-destructive/80 transition-colors"
                    onClick={(e) => e.stopPropagation()}
                  />
                </AlertDialogTrigger>
                <AlertDialogContent onClick={(e) => e.stopPropagation()}>
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
                      onClick={handleDelete}
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
                  <LogOut 
                    className="h-4 w-4 cursor-pointer text-destructive hover:text-destructive/80 transition-colors"
                    onClick={(e) => e.stopPropagation()}
                  />
                </AlertDialogTrigger>
                <AlertDialogContent onClick={(e) => e.stopPropagation()}>
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
                      onClick={handleLeave}
                      className="bg-destructive hover:bg-destructive/90"
                    >
                      Verlassen
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
            <ChevronRight className="h-4 w-4" />
          </div>
        </div>
      </CardHeader>
    </Card>
  );
};