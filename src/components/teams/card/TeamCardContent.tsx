import { Shield, Crown, Users } from "lucide-react";
import { type Tables } from "@/integrations/supabase/types";
import { useUser } from "@supabase/auth-helpers-react";

interface TeamCardContentProps {
  team: Tables<"teams"> & {
    stats?: {
      totalMembers: number;
      admins: number;
    };
  };
}

export const TeamCardContent = ({ team }: TeamCardContentProps) => {
  const user = useUser();
  const isTeamOwner = user?.id === team.created_by;

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-xl font-semibold mb-2">{team.name}</h3>
        {team.description && (
          <div 
            className="text-base text-muted-foreground prose"
            dangerouslySetInnerHTML={{ __html: team.description }}
          />
        )}
      </div>
      <div className="flex items-center gap-6 text-base text-muted-foreground">
        <span className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          <span>{team.stats?.totalMembers || 0}</span>
        </span>
        <span>•</span>
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          <span>{team.stats?.admins || 0}</span>
          {isTeamOwner && (
            <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1.5">
              <Crown className="h-4 w-4" />
              Team Owner
            </span>
          )}
        </div>
      </div>
    </div>
  );
};