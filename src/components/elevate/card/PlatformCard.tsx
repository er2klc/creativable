import { Card } from "@/components/ui/card";
import { PlatformCardActions } from "./PlatformCardActions";
import { useNavigate } from "react-router-dom";
import { useUser } from "@supabase/auth-helpers-react";
import { PlatformCardImage } from "./PlatformCardImage";
import { PlatformCardContent } from "./PlatformCardContent";

interface PlatformCardProps {
  platform: {
    id: string;
    name: string;
    description: string | null;
    created_by: string;
    logo_url: string | null;
    slug: string;
    stats?: {
      totalTeams: number;
      totalUsers: number;
    };
  };
  onDelete: (id: string) => void;
}

export const PlatformCard = ({ platform, onDelete }: PlatformCardProps) => {
  const navigate = useNavigate();
  const user = useUser();

  const handleClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button') || 
        (e.target as HTMLElement).closest('[role="dialog"]')) {
      return;
    }
    navigate(`/elevate/platform/${platform.slug}`);
  };

  const isPlatformOwner = user?.id === platform.created_by;

  return (
    <Card
      className="p-6 cursor-pointer hover:shadow-md transition-shadow relative overflow-hidden group"
      onClick={handleClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 flex-1">
          <PlatformCardImage platform={platform} />
          <PlatformCardContent platform={platform} />
        </div>
        <div className="flex items-center gap-2">
          <PlatformCardActions
            platformId={platform.id}
            onDelete={() => onDelete(platform.id)}
            isOwner={isPlatformOwner}
          />
        </div>
      </div>
    </Card>
  );
};