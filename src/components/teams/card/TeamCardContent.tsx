
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
    <div className="space-y-3 h-full flex flex-col">
      <div>
        <div className="flex items-center gap-2 mb-1.5">
          <h3 className="text-lg font-medium leading-none">{team.name}</h3>
          {isTeamOwner && (
            <span className="bg-yellow-50 text-yellow-700 px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1 whitespace-nowrap">
              <Crown className="h-3 w-3" />
              Team Owner
            </span>
          )}
        </div>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Users className="h-4 w-4" />
            <span>{team.stats?.totalMembers || 0}</span>
          </span>
          <span>•</span>
          <div className="flex items-center gap-1.5">
            <Shield className="h-4 w-4" />
            <span>{team.stats?.admins || 0}</span>
          </div>
        </div>
      </div>
      
      {team.description && (
        <div 
          className="text-sm text-muted-foreground/90 prose max-w-none flex-grow line-clamp-3"
          dangerouslySetInnerHTML={{ __html: team.description }}
        />
      )}
    </div>
  );
};
