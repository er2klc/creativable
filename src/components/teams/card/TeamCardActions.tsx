import { useState } from "react";
import { MoreVertical, Copy, Trash2, LogOut } from "lucide-react";
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
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
        <Button
          variant="ghost"
          className="h-8 w-8 p-0"
        >
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[160px]">
        {joinCode && (
          <DropdownMenuItem onClick={(e) => {
            e.stopPropagation();
            handleAction(() => onCopyJoinCode(joinCode, e));
          }}>
            <Copy className="mr-2 h-4 w-4" />
            Code kopieren
          </DropdownMenuItem>
        )}
        {isOwner ? (
          <DropdownMenuItem
            className="text-destructive focus:text-destructive"
            onClick={(e) => {
              e.stopPropagation();
              handleAction(onDelete);
            }}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Team löschen
          </DropdownMenuItem>
        ) : (
          teamMember && (
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={(e) => {
                e.stopPropagation();
                handleAction(onLeave);
              }}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Team verlassen
            </DropdownMenuItem>
          )
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};