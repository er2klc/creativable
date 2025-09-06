
import { Instagram, Linkedin, Facebook, Video, Users } from "lucide-react";

export const getPlatformIcon = (platform: string) => {
  switch (platform?.toLowerCase()) {
    case "instagram":
      return <Instagram className="h-4 w-4 text-white" />;
    case "linkedin":
      return <Linkedin className="h-4 w-4 text-white" />;
    case "facebook":
      return <Facebook className="h-4 w-4 text-white" />;
    case "tiktok":
      return <Video className="h-4 w-4 text-white" />;
    case "offline":
      return <Users className="h-4 w-4 text-white" />;
    default:
      return null;
  }
};

export const getPlatformColor = (platform: string) => {
  switch (platform?.toLowerCase()) {
    case "instagram":
      return "bg-gradient-to-br from-purple-600 to-pink-500";
    case "linkedin":
      return "bg-blue-600";
    case "facebook":
      return "bg-blue-700";
    case "tiktok":
      return "bg-black";
    default:
      return "bg-gray-500";
  }
};
