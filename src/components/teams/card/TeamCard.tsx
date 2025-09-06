
import { type Tables } from "@/integrations/supabase/types";
import { Card } from "@/components/ui/card";
import { TeamCardActions } from "./TeamCardActions";
import { useUser } from "@supabase/auth-helpers-react";
import { TeamCardImage } from "./TeamCardImage";
import { TeamCardContent } from "./TeamCardContent";
import { useTeamNavigation } from "@/hooks/useTeamNavigation";

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
  const { navigateToTeam } = useTeamNavigation();
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
    
    navigateToTeam(team.slug);
  };

  const isTeamOwner = isSuperAdmin || user?.id === team.created_by;

  return (
    <Card 
      className="group overflow-hidden bg-[#222] cursor-pointer"
      onClick={(e) => handleClick(e, false)}
    >
      <div className="relative h-[200px]">
        <TeamCardImage team={team} />
        <div className="absolute inset-0 bg-gradient-to-t from-[#222]/95 to-transparent" />
        <div className="absolute bottom-4 left-0 right-0 text-center">
          <h3 className="text-xl font-bold text-white/90">{team.name}</h3>
        </div>
        <div className="absolute top-4 right-4">
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
      <div className="p-6 bg-gradient-to-t from-[#333] to-[#222] min-h-[200px]">
        <TeamCardContent team={team} />
      </div>
    </Card>
  );
};
