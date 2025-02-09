
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useTeamPosts } from "./hooks/useTeamPosts";
import { PostItem } from "./components/PostItem";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";

interface PostListProps {
  teamId: string;
  categoryId?: string;
}

export const PostList = ({ teamId, categoryId }: PostListProps) => {
  const [expandedPost, setExpandedPost] = useState<string | null>(null);
  const { data: posts, isLoading, error, refetch } = useTeamPosts(teamId, categoryId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary/50" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="mb-4">
        <AlertDescription>
          Fehler beim Laden der Beiträge. Bitte versuchen Sie es später erneut.
          <button 
            onClick={() => refetch()} 
            className="ml-2 underline hover:no-underline"
          >
            Erneut versuchen
          </button>
        </AlertDescription>
      </Alert>
    );
  }

  if (!posts?.length) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            <p className="text-lg font-medium">Keine Beiträge gefunden</p>
            <p className="text-sm mt-1">Erstellen Sie den ersten Beitrag in dieser Kategorie!</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {posts.map((post) => (
        <PostItem
          key={post.id}
          post={post}
          isExpanded={expandedPost === post.id}
          onToggleComments={() => setExpandedPost(expandedPost === post.id ? null : post.id)}
        />
      ))}
    </div>
  );
};
