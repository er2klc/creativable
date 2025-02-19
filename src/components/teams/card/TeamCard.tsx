
import { type Tables } from "@/integrations/supabase/types";
import { Card } from "@/components/ui/card";
import { TeamCardActions } from "./TeamCardActions";
import { useNavigate } from "react-router-dom";
import { useUser } from "@supabase/auth-helpers-react";
import { TeamCardImage } from "./TeamCardImage";
import { TeamCardContent } from "./TeamCardContent";

interface TeamWithStats extends Tables<"teams"> {
  stats?: {
    totalMembers: number;
    admins: number;
  };
}

export interface TeamCardProps {
  team: TeamWithStats;
  onDelete: (id: string) => void;
  onLeave: (id: string) => void;
  onCopyJoinCode: (code: string) => void;
  isSuperAdmin?: boolean;
}

export const TeamCard = ({ 
  team, 
  onDelete, 
  onLeave, 
  onCopyJoinCode,
  isSuperAdmin = false
}: TeamCardProps) => {
  const navigate = useNavigate();
  const user = useUser();

  const handleClick = (e: React.MouseEvent, isVideoArea: boolean) => {
    if ((e.target as HTMLElement).closest('button') || 
        (e.target as HTMLElement).closest('[role="dialog"]')) {
      return;
    }
    
    if (isVideoArea && team.video_url) {
      window.open(team.video_url, '_blank');
      return;
    }
    
    navigate(`/unity/team/${team.slug}`);
  };

  const isTeamOwner = isSuperAdmin || user?.id === team.created_by;

  return (
    <Card className="overflow-hidden bg-card/50 hover:shadow-sm transition-shadow">
      <div className="flex flex-col">
        <div onClick={(e) => handleClick(e, true)}>
          <TeamCardImage team={team} />
        </div>
        <div 
          className="p-4 flex flex-col relative"
          onClick={(e) => handleClick(e, false)}
        >
          <div className="absolute top-3 right-3 z-10">
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
          <TeamCardContent team={team} />
        </div>
      </div>
    </Card>
  );
};
