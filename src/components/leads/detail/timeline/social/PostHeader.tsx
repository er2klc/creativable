import { format } from "date-fns";
import { de } from "date-fns/locale";

interface PostHeaderProps {
  timestamp: string;
  type: string;
  postTypeColor: string;
}

export const PostHeader = ({ timestamp, type, postTypeColor }: PostHeaderProps) => {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-muted-foreground">
        {timestamp && format(new Date(timestamp), "PPp", { locale: de })}
      </span>
      <span className={`text-xs px-2 py-1 rounded-full border ${postTypeColor}`}>
        {type || "Post"}
      </span>
    </div>
  );
};