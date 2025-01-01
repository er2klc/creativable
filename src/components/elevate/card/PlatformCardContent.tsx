import { Building, Users, Crown } from "lucide-react";
import { useUser } from "@supabase/auth-helpers-react";
import { Progress } from "@/components/ui/progress";

interface PlatformCardContentProps {
  platform: {
    name: string;
    description: string | null;
    created_by: string;
    stats?: {
      totalTeams: number;
      totalUsers: number;
      progress?: number;
    };
  };
}

export const PlatformCardContent = ({ platform }: PlatformCardContentProps) => {
  const user = useUser();
  const isPlatformOwner = user?.id === platform.created_by;
  const progress = platform.stats?.progress || 0;

  return (
    <div className="text-white">
      <h3 className="text-xl font-semibold mb-2">{platform.name}</h3>
      {platform.description && (
        <p className="text-sm text-white/80 mb-3">{platform.description}</p>
      )}
      <div className="flex items-center gap-4 text-sm text-white/90 mb-3">
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
      <div className="space-y-1">
        <div className="flex justify-between text-sm">
          <span>Fortschritt</span>
          <span>{progress}%</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>
    </div>
  );
};