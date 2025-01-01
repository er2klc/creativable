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
    invite_code?: string;
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
      className="relative overflow-hidden group cursor-pointer hover:shadow-md transition-shadow"
      onClick={handleClick}
    >
      <div className="relative">
        <PlatformCardImage platform={platform} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/40 to-transparent">
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <PlatformCardContent platform={platform} />
          </div>
        </div>
        <div className="absolute top-4 right-4">
          <PlatformCardActions
            platformId={platform.id}
            onDelete={() => onDelete(platform.id)}
            isOwner={isPlatformOwner}
            inviteCode={platform.invite_code}
          />
        </div>
      </div>
    </Card>
  );
};