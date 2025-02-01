import { MessageSquare, Video } from "lucide-react";
import { PostType } from "../../types/lead";

interface PostHeaderProps {
  type: PostType;
  postTypeColor: string;
  id: string;
}

export const PostHeader = ({ type, postTypeColor, id }: PostHeaderProps) => {
  return (
    <div className="flex items-center justify-between p-4">
      <div className="flex items-center gap-2">
        {type === 'video' ? (
          <Video className={postTypeColor} size={20} />
        ) : (
          <MessageSquare className={postTypeColor} size={20} />
        )}
        <span className={`text-sm font-medium ${postTypeColor}`}>
          {type.charAt(0).toUpperCase() + type.slice(1)}
        </span>
      </div>
    </div>
  );
};