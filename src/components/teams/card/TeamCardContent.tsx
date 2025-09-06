
import { Shield, Crown, Users } from "lucide-react";
import { type Tables } from "@/integrations/supabase/types";
import { useUser } from "@supabase/auth-helpers-react";
import { Progress } from "@/components/ui/progress";

interface TeamCardContentProps {
  team: Tables<"teams"> & {
    stats?: {
      totalMembers: number;
      admins: number;
    };
  };
}

const MAX_DESCRIPTION_LENGTH = 300;

export const TeamCardContent = ({ team }: TeamCardContentProps) => {
  const user = useUser();
  const isTeamOwner = user?.id === team.created_by;
  
  const maxMembers = team.max_members || 100;
  const memberProgress = (team.stats?.totalMembers || 0) / maxMembers * 100;

  const truncateDescription = (description: string) => {
    if (description.length <= MAX_DESCRIPTION_LENGTH) return description;
    return description.substring(0, MAX_DESCRIPTION_LENGTH) + "...";
  };

  return (
    <div className="space-y-4 font-light">
      {team.description && (
        <div 
          className="text-sm text-gray-300/90 font-normal min-h-[5rem]"
          dangerouslySetInnerHTML={{ 
            __html: truncateDescription(team.description)
          }}
        />
      )}
      
      <div className="flex items-center gap-4 text-xs text-gray-300/90">
        <span className="flex items-center gap-1">
          <Users className="h-4 w-4" />
          {team.stats?.totalMembers || 0} Mitglieder
        </span>
        <span className="text-gray-500">•</span>
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4" />
          <span>{team.stats?.admins || 0} Admins</span>
          {isTeamOwner && (
            <span className="bg-yellow-900/30 text-yellow-200/90 px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1">
              <Crown className="h-3 w-3" />
              Team Owner
            </span>
          )}
        </div>
      </div>
      
      <div className="space-y-1.5">
        <div className="flex justify-between text-sm text-gray-300/90">
          <span>Mitglieder</span>
          <span>{team.stats?.totalMembers || 0}/{maxMembers}</span>
        </div>
        <Progress value={memberProgress} className="h-2 bg-gray-700/50" />
      </div>
    </div>
  );
};
