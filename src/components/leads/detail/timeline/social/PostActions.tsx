interface PostActionsProps {
  likes: number;
  comments: number;
}

export const PostActions = ({ likes, comments }: PostActionsProps) => {
  return (
    <div className="flex items-center gap-4 text-sm text-gray-500">
      <div>
        <span className="font-medium">{likes}</span> likes
      </div>
      <div>
        <span className="font-medium">{comments}</span> comments
      </div>
    </div>
  );
};