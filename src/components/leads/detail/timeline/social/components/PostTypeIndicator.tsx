import { Video, Image, MessageCircle, Heart } from "lucide-react";
import { cn } from "@/lib/utils";

interface PostTypeIndicatorProps {
  type: string;
  postTypeColor: string;
}

export const PostTypeIndicator = ({ type, postTypeColor }: PostTypeIndicatorProps) => {
  const getPostTypeIcon = (type: string) => {
    switch (type?.toLowerCase()) {
      case "video":
        return <Video className="h-5 w-5 text-cyan-500 border-cyan-500" />;
      case "image":
        return <Image className="h-5 w-5 text-purple-500 border-purple-500" />;
      case "sidecar":
        return <MessageCircle className="h-5 w-5 text-amber-500 border-amber-500" />;
      default:
        return <Heart className="h-5 w-5 text-gray-500 border-gray-500" />;
    }
  };

  return (
    <div className={cn("w-8 h-8 rounded-full flex items-center justify-center", postTypeColor)}>
      {getPostTypeIcon(type)}
    </div>
  );
};