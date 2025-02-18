
import { PostReactions } from "../reactions/PostReactions";
import { PostActions } from "../actions/PostActions";

interface PostFooterProps {
  postId: string;
  teamId: string;
  postTitle: string;
  isAdmin: boolean;
  isPinned: boolean;
  borderColor: string;
}

export const PostFooter = ({ 
  postId, 
  teamId, 
  postTitle, 
  isAdmin, 
  isPinned,
  borderColor 
}: PostFooterProps) => {
  return (
    <div 
      className="px-4 py-2 border-t" 
      style={{ borderColor }}
    >
      <div className="flex items-center justify-between">
        <PostReactions postId={postId} teamId={teamId} />
        <PostActions 
          postId={postId} 
          teamId={teamId}
          isSubscribed={false}
          postTitle={postTitle}
          isAdmin={isAdmin}
          isPinned={isPinned}
        />
      </div>
    </div>
  );
};
