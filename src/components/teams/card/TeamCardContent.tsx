
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
    <div className="space-y-1.5">
      <div className="flex items-start justify-between min-h-[24px]">
        <h3 className="text-sm font-medium leading-tight">{team.name}</h3>
        {isTeamOwner && (
          <span className="bg-yellow-50 text-yellow-700 px-1.5 py-0.5 rounded-full text-xs font-medium flex items-center gap-0.5 whitespace-nowrap ml-1.5">
            <Crown className="h-3 w-3" />
            Owner
          </span>
        )}
      </div>
      
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <span className="flex items-center gap-0.5">
          <Users className="h-3.5 w-3.5" />
          <span>{team.stats?.totalMembers || 0}</span>
        </span>
        <span className="text-muted-foreground/40">•</span>
        <div className="flex items-center gap-0.5">
          <Shield className="h-3.5 w-3.5" />
          <span>{team.stats?.admins || 0}</span>
        </div>
      </div>
      
      {team.description && (
        <div 
          className="text-xs text-muted-foreground/90 line-clamp-2"
          dangerouslySetInnerHTML={{ __html: team.description }}
        />
      )}
    </div>
  );
};
