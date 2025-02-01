import { Button } from "@/components/ui/button";

export interface PostActionsProps {
  likesCount: number;
  commentsCount: number;
  platform: string;
}

export const PostActions = ({ likesCount, commentsCount, platform }: PostActionsProps) => {
  return (
    <div className="flex justify-between items-center">
      <div className="flex items-center">
        <Button variant="outline" className="mr-2">
          Like {likesCount > 0 && `(${likesCount})`}
        </Button>
        <Button variant="outline">
          Comment {commentsCount > 0 && `(${commentsCount})`}
        </Button>
      </div>
      <span className="text-sm text-gray-500">{platform}</span>
    </div>
  );
};
