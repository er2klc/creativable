
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useTeamPosts } from "./hooks/useTeamPosts";
import { PostItem } from "./components/PostItem";
import { CreatePostDialog } from "./CreatePostDialog";

interface PostListProps {
  teamId: string;
  categoryId?: string;
}

export const PostList = ({ teamId, categoryId }: PostListProps) => {
  const [expandedPost, setExpandedPost] = useState<string | null>(null);
  const { data: posts, isLoading } = useTeamPosts(teamId, categoryId);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-1/4"></div>
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <CreatePostDialog teamId={teamId} categoryId={categoryId} />
      </div>
      
      {!posts?.length ? (
        <Card>
          <CardContent className="p-6 text-center text-muted-foreground">
            Keine Beiträge gefunden
          </CardContent>
        </Card>
      ) : (
        posts.map((post) => (
          <PostItem
            key={post.id}
            post={post}
            isExpanded={expandedPost === post.id}
            onToggleComments={() => setExpandedPost(expandedPost === post.id ? null : post.id)}
          />
        ))
      )}
    </div>
  );
};
