import { LogOut, Trash2, Copy, Edit } from "lucide-react";
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
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TeamLogoUpload } from "@/components/teams/TeamLogoUpload";
import { toast } from "sonner";

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
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [logoUrl, setLogoUrl] = useState<string | null>(null);

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

  // Fetch team data when edit dialog opens
  const { data: team } = useQuery({
    queryKey: ["team", teamId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("teams")
        .select("*")
        .eq("id", teamId)
        .single();

      if (error) throw error;

      setName(data.name);
      setDescription(data.description || "");
      setLogoUrl(data.logo_url);

      return data;
    },
    enabled: isEditDialogOpen,
  });

  const handleSave = async () => {
    try {
      const { error } = await supabase
        .from("teams")
        .update({
          name,
          description,
          logo_url: logoUrl,
        })
        .eq("id", teamId);

      if (error) throw error;

      toast.success("Team erfolgreich aktualisiert");
      setIsEditDialogOpen(false);
    } catch (error) {
      console.error("Error updating team:", error);
      toast.error("Fehler beim Aktualisieren des Teams");
    }
  };

  const isMember = !!teamMember;
  const isTeamOwner = teamMember?.role === 'owner';

  return (
    <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
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
      {isOwner && (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsEditDialogOpen(true)}
          className="h-8 w-8"
          title="Team bearbeiten"
        >
          <Edit className="h-4 w-4" />
        </Button>
      )}
      {isMember && !isTeamOwner ? (
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
      ) : isTeamOwner && (
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

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Team bearbeiten</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Team Name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Beschreibung</Label>
              <Input
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Team Beschreibung"
              />
            </div>
            <TeamLogoUpload
              teamId={teamId}
              currentLogoUrl={logoUrl}
              onLogoChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onloadend = () => {
                    setLogoUrl(reader.result as string);
                  };
                  reader.readAsDataURL(file);
                }
              }}
              onLogoRemove={() => setLogoUrl(null)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Abbrechen
            </Button>
            <Button onClick={handleSave}>
              Speichern
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};