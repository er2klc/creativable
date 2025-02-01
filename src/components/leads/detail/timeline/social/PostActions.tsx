export interface PostActionsProps {
  likesCount: number;
  commentsCount: number;
  platform: string;
}

export const PostActions = ({ likesCount, commentsCount, platform }: PostActionsProps) => {
  return (
    <div className="flex items-center space-x-4 text-sm text-gray-500">
      <span>{likesCount} likes</span>
      <span>{commentsCount} comments</span>
      <span>{platform}</span>
    </div>
  );
};