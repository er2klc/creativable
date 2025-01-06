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

  const isTeamOwner = user?.id === team.created_by;

  return (
    <Card
      className="cursor-pointer hover:shadow-md transition-shadow relative overflow-hidden group w-full"
    >
      <div className="flex flex-col">
        <div onClick={(e) => handleClick(e, true)}>
          <TeamCardImage team={team} />
        </div>
        <div 
          className="p-6 space-y-6"
          onClick={(e) => handleClick(e, false)}
        >
          <TeamCardContent team={team} />
          <div className="flex justify-end">
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