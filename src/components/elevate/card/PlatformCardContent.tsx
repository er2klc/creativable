import { Building, Users, Crown } from "lucide-react";
import { useUser } from "@supabase/auth-helpers-react";

interface PlatformCardContentProps {
  platform: {
    name: string;
    description: string | null;
    created_by: string;
    stats?: {
      totalTeams: number;
      totalUsers: number;
    };
  };
}

export const PlatformCardContent = ({ platform }: PlatformCardContentProps) => {
  const user = useUser();
  const isPlatformOwner = user?.id === platform.created_by;

  return (
    <div className="text-white">
      <h3 className="text-xl font-semibold mb-2">{platform.name}</h3>
      {platform.description && (
        <p className="text-sm text-white/80 mb-3">{platform.description}</p>
      )}
      <div className="flex items-center gap-4 text-sm text-white/90">
        <span className="flex items-center gap-1">
          <Building className="h-4 w-4" />
          {platform.stats?.totalTeams || 0} Teams
        </span>
        <span>•</span>
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4" />
          <span>{platform.stats?.totalUsers || 0} Benutzer</span>
          {isPlatformOwner && (
            <span className="bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1">
              <Crown className="h-3 w-3" />
              Modul Owner
            </span>
          )}
        </div>
      </div>
    </div>
  );
};