import { Copy, Trash2, LogOut, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

interface TeamCardActionsProps {
  teamId: string;
  userId?: string;
  isOwner: boolean;
  joinCode?: string;
  onDelete: () => void;
  onLeave: () => void;
  onCopyJoinCode: (code: string, e?: React.MouseEvent) => void;
}

export const TeamCardActions = ({
  teamId,
  userId,
  isOwner,
  joinCode,
  onDelete,
  onLeave,
  onCopyJoinCode,
}: TeamCardActionsProps) => {
  const { data: teamMember } = useQuery({
    queryKey: ["team-member", teamId, userId],
    queryFn: async () => {
      if (!userId) return null;
      
      const { data, error } = await supabase
        .from("team_members")
        .select("id")
        .eq("team_id", teamId)
        .eq("user_id", userId)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!userId && !!teamId,
  });

  return (
    <div className="flex items-center gap-2">
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
      {isOwner ? (
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="h-8 w-8 text-destructive hover:text-destructive"
          title="Team löschen"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      ) : (
        teamMember && (
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
        )
      )}
    </div>
  );
};