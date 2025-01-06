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
        <h3 className="text-2xl font-semibold mb-3">{team.name}</h3>
        {team.description && (
          <p className="text-lg text-muted-foreground">{team.description}</p>
        )}
      </div>
      <div className="flex items-center gap-8 text-lg text-muted-foreground">
        <span className="flex items-center gap-3">
          <Users className="h-6 w-6" />
          <span>{team.stats?.totalMembers || 0}</span>
        </span>
        <span>•</span>
        <div className="flex items-center gap-3">
          <Shield className="h-6 w-6" />
          <span>{team.stats?.admins || 0}</span>
          {isTeamOwner && (
            <span className="bg-yellow-100 text-yellow-800 px-4 py-1.5 rounded-full text-base font-medium flex items-center gap-2">
              <Crown className="h-5 w-5" />
              Team Owner
            </span>
          )}
        </div>
      </div>
    </div>
  );
};