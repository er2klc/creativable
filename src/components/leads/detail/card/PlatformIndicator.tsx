import { Instagram, Linkedin, Facebook, Video, Users } from "lucide-react";
import { cn } from "@/lib/utils";

interface PlatformIndicatorProps {
  platform: string;
}

export const PlatformIndicator = ({ platform }: PlatformIndicatorProps) => {
  const getPlatformIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'instagram':
        return <Instagram className="h-5 w-5 text-white" />;
      case 'linkedin':
        return <Linkedin className="h-5 w-5 text-white" />;
      case 'facebook':
        return <Facebook className="h-5 w-5 text-white" />;
      case 'tiktok':
        return <Video className="h-5 w-5 text-white" />;
      default:
        return <Users className="h-5 w-5 text-white" />;
    }
  };

  const getColor = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'instagram':
        return 'bg-gradient-to-br from-purple-600 to-pink-500';
      case 'linkedin':
        return 'bg-blue-600';
      case 'facebook':
        return 'bg-blue-700';
      case 'tiktok':
        return 'bg-black';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className={cn(
      "absolute -right-2 -top-2 rounded-full w-8 h-8 border-2 border-white shadow-lg flex items-center justify-center",
      getColor(platform)
    )}>
      {getPlatformIcon(platform)}
    </div>
  );
};