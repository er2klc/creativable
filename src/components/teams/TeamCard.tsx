import { type Tables } from "@/integrations/supabase/types";
import { Card } from "@/components/ui/card";
import { TeamCardActions } from "./card/TeamCardActions";
import { useNavigate } from "react-router-dom";
import { useUser } from "@supabase/auth-helpers-react";
import { TeamCardImage } from "./card/TeamCardImage";
import { TeamCardContent } from "./card/TeamCardContent";

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
}

export const TeamCard = ({ 
  team, 
  onDelete, 
  onLeave, 
  onCopyJoinCode 
}: TeamCardProps) => {
  const navigate = useNavigate();
  const user = useUser();

  const handleClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button') || 
        (e.target as HTMLElement).closest('[role="dialog"]')) {
      return;
    }
    navigate(`/unity/team/${team.slug}`);
  };

  const isTeamOwner = user?.id === team.created_by;

  return (
    <Card
      className="cursor-pointer hover:shadow-md transition-shadow relative overflow-hidden group min-h-[200px]"
      onClick={handleClick}
    >
      <div className="flex flex-col gap-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4 flex-1">
            <TeamCardImage team={team} />
            <TeamCardContent team={team} />
          </div>
          <div className="flex items-start gap-2">
            <TeamCardActions
              teamId={team.id}
              joinCode={team.join_code}
              onDelete={() => onDelete(team.id)}
              onLeave={() => onLeave(team.id)}
              onCopyJoinCode={onCopyJoinCode}
              isOwner={isTeamOwner}
              team={team}
            />
          </div>
        </div>
      </div>
    </Card>
  );
};