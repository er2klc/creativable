
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
    <div className="space-y-2">
      <div className="flex items-start justify-between mb-1 min-h-[28px]">
        <h3 className="text-base font-medium leading-tight">{team.name}</h3>
        {isTeamOwner && (
          <span className="bg-yellow-50 text-yellow-700 px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1 whitespace-nowrap ml-2">
            <Crown className="h-3 w-3" />
            Owner
          </span>
        )}
      </div>
      
      <div className="flex items-center gap-3 text-sm text-muted-foreground">
        <span className="flex items-center gap-1">
          <Users className="h-4 w-4" />
          <span>{team.stats?.totalMembers || 0}</span>
        </span>
        <span className="text-muted-foreground/40">•</span>
        <div className="flex items-center gap-1">
          <Shield className="h-4 w-4" />
          <span>{team.stats?.admins || 0}</span>
        </div>
      </div>
      
      {team.description && (
        <div 
          className="text-sm text-muted-foreground/90 line-clamp-2 mt-2"
          dangerouslySetInnerHTML={{ __html: team.description }}
        />
      )}
    </div>
  );
};
