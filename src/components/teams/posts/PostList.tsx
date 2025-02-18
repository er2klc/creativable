
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useTeamPosts } from "./hooks/useTeamPosts";
import { PostCard } from "./components/PostCard";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PostListProps {
  teamId: string;
  categoryId?: string;
}

export const PostList = ({ teamId, categoryId }: PostListProps) => {
  const [page, setPage] = useState(0);
  const { data, isLoading, error, refetch } = useTeamPosts(teamId, categoryId, page);
  const posts = data?.posts || [];
  const totalCount = data?.totalCount || 0;
  const totalPages = Math.ceil(totalCount / 100);

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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {posts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            teamSlug={teamId}
            size={post.team_categories?.settings?.size || 'medium'}
          />
        ))}
      </div>
      
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 pt-4 border-t">
          <Button
            variant="outline"
            onClick={() => setPage(p => Math.max(0, p - 1))}
            disabled={page === 0}
          >
            <ChevronLeft className="h-4 w-4" />
            Vorherige
          </Button>
          <span className="text-sm text-muted-foreground">
            Seite {page + 1} von {totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
            disabled={page >= totalPages - 1}
          >
            Nächste
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
};
