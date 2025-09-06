import { Platform } from "@/config/platforms";
import { Instagram, Linkedin, Facebook, Video, Users } from "lucide-react";

interface LeadNameProps {
  name: string;
  platform: Platform;
}

export function LeadName({ name, platform }: LeadNameProps) {
  const getPlatformIcon = (platform: Platform) => {
    switch (platform) {
      case "Instagram":
        return <Instagram className="h-4 w-4 mr-2" />;
      case "LinkedIn":
        return <Linkedin className="h-4 w-4 mr-2" />;
      case "Facebook":
        return <Facebook className="h-4 w-4 mr-2" />;
      case "TikTok":
        return <Video className="h-4 w-4 mr-2" />;
      case "Offline":
        return <Users className="h-4 w-4 mr-2" />;
      default:
        return null;
    }
  };

  return (
    <div className="flex items-center gap-2">
      {getPlatformIcon(platform)}
      <div
        className="text-2xl font-semibold bg-transparent border-none p-0 overflow-hidden whitespace-nowrap text-ellipsis"
        title={name}
      >
        {name}
      </div>
    </div>
  );
}