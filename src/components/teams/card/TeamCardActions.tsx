import { useState } from "react";
import { Copy, Trash2, LogOut, MoreVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  const [isOpen, setIsOpen] = useState(false);

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

  const handleAction = (action: () => void) => {
    action();
    setIsOpen(false);
  };

  return (
    <div className="flex gap-2">
      {joinCode && (
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onCopyJoinCode(joinCode, e);
          }}
          className="flex items-center gap-2"
        >
          <Copy className="h-4 w-4" />
          Code kopieren
        </Button>
      )}
      {isOwner ? (
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="flex items-center gap-2 text-destructive hover:text-destructive"
        >
          <Trash2 className="h-4 w-4" />
          Team löschen
        </Button>
      ) : (
        teamMember && (
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onLeave();
            }}
            className="flex items-center gap-2 text-destructive hover:text-destructive"
          >
            <LogOut className="h-4 w-4" />
            Team verlassen
          </Button>
        )
      )}
    </div>
  );
};