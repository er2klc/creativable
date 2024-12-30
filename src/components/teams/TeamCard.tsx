import { type Tables } from "@/integrations/supabase/types";
import { Card } from "@/components/ui/card";
import { TeamCardActions } from "./card/TeamCardActions";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Users, Shield } from "lucide-react";

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

export const TeamCard = ({ team, onDelete, onLeave, onCopyJoinCode }: TeamCardProps) => {
  const navigate = useNavigate();

  const handleClick = (e: React.MouseEvent) => {
    // Only navigate if the click wasn't on a button
    if ((e.target as HTMLElement).closest('button')) {
      return;
    }
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
            <Avatar className="h-16 w-16">
              <AvatarImage src={team.logo_url} alt={team.name} />
              <AvatarFallback>{team.name.substring(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
          ) : (
            <Avatar className="h-16 w-16">
              <AvatarFallback>{team.name.substring(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
          )}
          <div>
            <h3 className="text-lg font-semibold">{team.name}</h3>
            {team.description && (
              <p className="text-sm text-muted-foreground">{team.description}</p>
            )}
            <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                {team.stats?.totalMembers || 0}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Shield className="h-4 w-4" />
                {team.stats?.admins || 0}
              </span>
            </div>
          </div>
        </div>
        <TeamCardActions
          teamId={team.id}
          joinCode={team.join_code}
          onDelete={() => onDelete(team.id)}
          onLeave={() => onLeave(team.id)}
          onCopyJoinCode={onCopyJoinCode}
          isOwner={team.created_by === team.created_by}
        />
      </div>
    </Card>
  );
};