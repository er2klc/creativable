import { type Tables } from "@/integrations/supabase/types";
import { Card } from "@/components/ui/card";
import { TeamCardActions } from "./card/TeamCardActions";
import { useNavigate } from "react-router-dom";
import { useUser } from "@supabase/auth-helpers-react";
import { TeamCardImage } from "./card/TeamCardImage";
import { TeamCardContent } from "./card/TeamCardContent";
import { TeamOrderButtons } from "./card/TeamOrderButtons";

interface TeamCardProps {
  team: Tables<"teams"> & {
    stats?: {
      totalMembers: number;
      admins: number;
    };
  };
  isFirst?: boolean;
  isLast?: boolean;
  onDelete: (id: string) => void;
  onLeave: (id: string) => void;
  onCopyJoinCode: (code: string) => void;
  onUpdateOrder?: (teamId: string, direction: 'up' | 'down') => void;
}

export const TeamCard = ({ 
  team, 
  isFirst = false,
  isLast = false,
  onDelete, 
  onLeave, 
  onCopyJoinCode,
  onUpdateOrder 
}: TeamCardProps) => {
  const navigate = useNavigate();
  const user = useUser();

  const handleClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button') || 
        (e.target as HTMLElement).closest('[role="dialog"]')) {
      return;
    }
    navigate(`/unity/team/${team.id}`);
  };

  const isTeamOwner = user?.id === team.created_by;

  return (
    <Card
      className="p-6 cursor-pointer hover:shadow-md transition-shadow relative overflow-hidden group"
      onClick={handleClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 flex-1">
          <TeamCardImage team={team} />
          <TeamCardContent team={team} />
        </div>
        <div className="flex items-center gap-2">
          {onUpdateOrder && isTeamOwner && (
            <TeamOrderButtons
              isFirst={isFirst}
              isLast={isLast}
              onUpdateOrder={(direction) => onUpdateOrder(team.id, direction)}
            />
          )}
          <TeamCardActions
            teamId={team.id}
            joinCode={team.join_code}
            onDelete={() => onDelete(team.id)}
            onLeave={() => onLeave(team.id)}
            onCopyJoinCode={onCopyJoinCode}
            isOwner={isTeamOwner}
          />
        </div>
      </div>
    </Card>
  );
};