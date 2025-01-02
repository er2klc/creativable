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
    <div className="space-y-4 font-light">
      {platform.description && (
        <p className="text-sm text-gray-300/90 line-clamp-2 font-normal">
          {platform.description}
        </p>
      )}
      
      <div className="flex items-center gap-4 text-xs text-gray-300/90">
        <span className="flex items-center gap-1">
          <Building className="h-4 w-4" />
          {platform.stats?.totalTeams || 0} Teams
        </span>
        <span className="text-gray-500">•</span>
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4" />
          <span>{platform.stats?.totalUsers || 0} Benutzer</span>
          {isPlatformOwner && (
            <span className="bg-yellow-900/30 text-yellow-200/90 px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1">
              <Crown className="h-3 w-3" />
              Modul Owner
            </span>
          )}
        </div>
      </div>
      
      <div className="space-y-1.5">
        <div className="flex justify-between text-sm text-gray-300/90">
          <span>Fortschritt</span>
          <span>{progress}%</span>
        </div>
        <Progress value={progress} className="h-2 bg-gray-700/50" />
      </div>
    </div>
  );
};