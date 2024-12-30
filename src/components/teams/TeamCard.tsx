import { Card } from "@/components/ui/card";
import { TeamCardActions } from "./card/TeamCardActions";
import { useNavigate } from "react-router-dom";
import { type Team } from "@/integrations/supabase/types/teams";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface TeamCardProps {
  team: Team & {
    stats?: {
      totalMembers: number;
      admins: number;
    };
  };
  onDelete: (id: string) => void;
  onLeave: (id: string) => void;
  onCopyJoinCode: (code: string) => void;
}

export const TeamCard = ({ team, onDelete, onLeave, onCopyJoinCode }: TeamCardProps) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/unity/team/${team.slug}`);
  };

  return (
    <Card
      className="p-6 cursor-pointer hover:shadow-md transition-shadow"
      onClick={handleClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {team.logo_url ? (
            <Avatar className="h-12 w-12">
              <AvatarImage src={team.logo_url} alt={team.name} />
              <AvatarFallback>{team.name.substring(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
          ) : (
            <Avatar className="h-12 w-12">
              <AvatarFallback>{team.name.substring(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
          )}
          <div>
            <h3 className="text-lg font-semibold">{team.name}</h3>
            {team.description && (
              <p className="text-sm text-muted-foreground">{team.description}</p>
            )}
            <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
              <span>{team.stats?.totalMembers || 0} Mitglieder</span>
              <span>•</span>
              <span>{team.stats?.admins || 0} Admins</span>
            </div>
          </div>
        </div>
        <TeamCardActions
          teamId={team.id}
          joinCode={team.join_code}
          onDelete={() => onDelete(team.id)}
          onLeave={() => onLeave(team.id)}
          onCopyJoinCode={onCopyJoinCode}
        />
      </div>
    </Card>
  );
};