export interface PostActionsProps {
  likes: number;
  comments: number;
}

export const PostActions = ({ likes, comments }: PostActionsProps) => {
  return (
    <div className="flex items-center space-x-4 text-sm text-gray-500">
      <span>{likes} likes</span>
      <span>{comments} comments</span>
    </div>
  );
};