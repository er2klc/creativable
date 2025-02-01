import { format } from "date-fns";
import { de } from "date-fns/locale";

interface PostHeaderProps {
  timestamp: string;
  type: string;
  postTypeColor: string;
  id?: string; // Added ID as optional prop
}

export const PostHeader = ({ type, postTypeColor, id }: PostHeaderProps) => {
  return (
    <div className="flex items-center justify-between mb-2">
      <span className={`text-xs px-2 py-1 rounded-full border ${postTypeColor}`}>
        {type || "Post"}
      </span>
      {id && (
        <span className="text-xs text-gray-500">
          ID: {id}
        </span>
      )}
    </div>
  );
};