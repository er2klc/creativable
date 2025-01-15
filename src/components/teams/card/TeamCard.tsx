import { useNavigate } from "react-router-dom";
import { useUser } from "@supabase/auth-helpers-react";
import { Card, CardContent } from "@/components/ui/card";
import { TeamCardImage } from "./TeamCardImage";
import { TeamCardContent } from "./TeamCardContent";
import { TeamCardActions } from "./TeamCardActions";
import { TeamOrderButtons } from "./TeamOrderButtons";
import { toast } from "sonner";
import { type Tables } from "@/integrations/supabase/types";

export interface TeamWithStats extends Tables<"teams"> {
  stats?: {
    totalMembers: number;
    admins: number;
  };
}

interface TeamCardProps {
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
  isSuperAdmin 
}: TeamCardProps) => {
  const navigate = useNavigate();
  const user = useUser();

  const handleCardClick = () => {
    if (!team.slug) {
      toast.error("Team URL ist nicht verfügbar");
      return;
    }
    
    navigate(`/team/${team.slug}`);
  };

  const isTeamOwner = user?.id === team.created_by;

  return (
    <Card className="overflow-hidden group relative">
      <CardContent className="p-0">
        <div onClick={handleCardClick} className="cursor-pointer">
          <TeamCardImage team={team} />
          <TeamCardContent team={team} />
        </div>
        
        <TeamCardActions 
          teamId={team.id}
          isOwner={isTeamOwner}
          joinCode={team.join_code}
          onDelete={() => onDelete(team.id)}
          onLeave={() => onLeave(team.id)}
          onCopyJoinCode={onCopyJoinCode}
          team={team}
        />

        {isTeamOwner && (
          <TeamOrderButtons teamId={team.id} orderIndex={team.order_index} />
        )}
      </CardContent>
    </Card>
  );
};