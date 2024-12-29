import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useUser } from "@supabase/auth-helpers-react";
import { TeamHeaderTitle } from "./header/TeamHeaderTitle";
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

interface TeamHeaderProps {
  team: {
    id: string;
    name: string;
    logo_url?: string;
  };
}

export function TeamHeader({ team }: TeamHeaderProps) {
  const navigate = useNavigate();
  const user = useUser();

  const { data: memberRole } = useQuery({
    queryKey: ['team-member-role', team.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('team_members')
        .select('role')
        .eq('team_id', team.id)
        .eq('user_id', user?.id)
        .maybeSingle();

      return data?.role;
    },
    enabled: !!user?.id && !!team.id,
  });

  const isAdmin = memberRole === 'admin' || memberRole === 'owner';

  const { data: members } = useQuery({
    queryKey: ['team-members', team.id],
    queryFn: async () => {
      const { data: teamMembers, error } = await supabase
        .from('team_members')
        .select('id, role, user_id, profiles:user_id(display_name)')
        .eq('team_id', team.id);

      if (error) {
        console.error('Error fetching team members:', error);
        return [];
      }

      return teamMembers.map(member => ({
        ...member,
        display_name: member.profiles?.display_name || 'Unbekannter Benutzer'
      }));
    },
    enabled: !!team.id,
  });

  const handleLeaveTeam = async () => {
    try {
      const { data: membershipData } = await supabase
        .from('team_members')
        .select('id')
        .eq('team_id', team.id)
        .eq('user_id', user?.id)
        .maybeSingle();

      if (!membershipData) {
        toast.error("Mitgliedschaft nicht gefunden");
        return;
      }

      const { error } = await supabase
        .from('team_members')
        .delete()
        .eq('id', membershipData.id);

      if (error) throw error;

      toast.success("Team erfolgreich verlassen");
      navigate('/unity');
    } catch (error) {
      console.error('Error leaving team:', error);
      toast.error("Fehler beim Verlassen des Teams");
    }
  };

  const handleDeleteTeam = async () => {
    try {
      const { error } = await supabase
        .from('teams')
        .delete()
        .eq('id', team.id);

      if (error) throw error;

      toast.success("Team erfolgreich gelöscht");
      navigate('/unity');
    } catch (error) {
      console.error('Error deleting team:', error);
      toast.error("Fehler beim Löschen des Teams");
    }
  };

  // Filter admins from the full members list
  const adminMembers = members?.filter(member => 
    member.role === 'admin' || member.role === 'owner'
  ) || [];

  // Calculate counts
  const membersCount = members?.length || 0;
  const adminsCount = adminMembers.length;

  return (
    <div className="bg-background border-b">
      <div className="container py-4">
        <div className="flex items-center justify-between">
          <TeamHeaderTitle 
            team={team}
            isAdmin={isAdmin}
            membersCount={membersCount}
            adminsCount={adminsCount}
            members={members || []}
            adminMembers={adminMembers}
          />
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
        </div>
        <Separator className="my-4" />
      </div>
    </div>
  );
}