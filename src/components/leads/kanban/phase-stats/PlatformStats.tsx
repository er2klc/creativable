
import { Instagram, Linkedin, Facebook, Video, Users } from "lucide-react";
import { Tables } from "@/integrations/supabase/types";

interface PlatformStatsProps {
  leads: Tables<"leads">[];
}

export const PlatformStats = ({ leads }: PlatformStatsProps) => {
  // Group leads by platform and count them
  const platformCounts = leads.reduce((acc, lead) => {
    const platform = lead.platform.toLowerCase();
    acc[platform] = (acc[platform] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case "instagram":
        return <Instagram className="h-4 w-4" />;
      case "linkedin":
        return <Linkedin className="h-4 w-4" />;
      case "facebook":
        return <Facebook className="h-4 w-4" />;
      case "tiktok":
        return <Video className="h-4 w-4" />;
      case "offline":
        return <Users className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case "instagram":
        return "text-pink-500";
      case "linkedin":
        return "text-blue-600";
      case "facebook":
        return "text-blue-500";
      case "tiktok":
        return "text-gray-900";
      case "offline":
        return "text-gray-500";
      default:
        return "text-gray-500";
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      {Object.entries(platformCounts).map(([platform, count]) => (
        <div 
          key={platform}
          className="flex items-center gap-1 text-xs"
        >
          <span className={getPlatformColor(platform)}>
            {getPlatformIcon(platform)}
          </span>
          <span className="font-medium">{count}</span>
        </div>
      ))}
    </div>
  );
};
