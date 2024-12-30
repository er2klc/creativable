import { type Tables } from "@/integrations/supabase/types";
import { Card } from "@/components/ui/card";
import { TeamCardActions } from "./card/TeamCardActions";
import { useNavigate } from "react-router-dom";
import { Users, Shield, ArrowUpDown, Crown } from "lucide-react";
import { useUser } from "@supabase/auth-helpers-react";
import { Button } from "@/components/ui/button";

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
  onUpdateOrder?: (teamId: string, direction: 'up' | 'down') => void;
}

export const TeamCard = ({ team, onDelete, onLeave, onCopyJoinCode, onUpdateOrder }: TeamCardProps) => {
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
      className="p-6 cursor-pointer hover:shadow-md transition-shadow relative overflow-hidden group"
      onClick={handleClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 flex-1">
          <div className="relative min-w-[120px] h-20 rounded-lg overflow-hidden">
            {team.logo_url ? (
              <>
                <img 
                  src={team.logo_url} 
                  alt={team.name} 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-background/80" />
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-muted">
                <span className="text-xl font-semibold">
                  {team.name.substring(0, 2).toUpperCase()}
                </span>
              </div>
            )}
          </div>
          <div className="flex-1">
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
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                <span>{team.stats?.admins || 0}</span>
                {isTeamOwner && (
                  <span className="bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1">
                    <Crown className="h-3 w-3" />
                    Team Owner
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {onUpdateOrder && (
            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-1">
              <Button 
                variant="ghost" 
                size="icon"
                className="h-6 w-6"
                onClick={(e) => {
                  e.stopPropagation();
                  onUpdateOrder(team.id, 'up');
                }}
                title="Nach oben verschieben"
              >
                <ArrowUpDown className="h-4 w-4" />
              </Button>
            </div>
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