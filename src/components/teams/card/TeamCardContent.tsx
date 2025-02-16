
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
    <div className="space-y-4 h-full flex flex-col">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-2xl font-semibold mb-2">{team.name}</h3>
          <div className="flex items-center gap-6 text-base text-muted-foreground">
            <span className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              <span>{team.stats?.totalMembers || 0}</span>
            </span>
            <span>•</span>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              <span>{team.stats?.admins || 0}</span>
            </div>
          </div>
        </div>
        {isTeamOwner && (
          <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1.5 whitespace-nowrap">
            <Crown className="h-4 w-4" />
            Team Owner
          </span>
        )}
      </div>
      
      {team.description && (
        <div 
          className="text-base text-muted-foreground prose max-w-none flex-grow"
          dangerouslySetInnerHTML={{ __html: team.description }}
        />
      )}
    </div>
  );
};
