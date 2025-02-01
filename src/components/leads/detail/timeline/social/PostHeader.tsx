import { formatDistanceToNow } from "date-fns";
import { useSettings } from "@/hooks/use-settings";

export interface PostHeaderProps {
  platform: string;
  timestamp: string;
  username: string;
}

export const PostHeader = ({ platform, timestamp, username }: PostHeaderProps) => {
  const { settings } = useSettings();
  const timeAgo = formatDistanceToNow(new Date(timestamp), { addSuffix: true });

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center">
        <span className="font-semibold">{username}</span>
        <span className="text-gray-500 ml-2">{timeAgo}</span>
      </div>
      <span className="text-sm text-gray-400">{platform}</span>
    </div>
  );
};
