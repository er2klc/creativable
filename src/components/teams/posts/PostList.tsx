import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { de } from "date-fns/locale";

interface PostListProps {
  teamId: string;
  categoryId?: string;
}

export const PostList = ({ teamId, categoryId }: PostListProps) => {
  const { data: posts, isLoading } = useQuery({
    queryKey: ['team-posts', teamId, categoryId],
    queryFn: async () => {
      let query = supabase
        .from('team_posts')
        .select(`
          *,
          team_categories (name)
        `)
        .eq('team_id', teamId)
        .order('created_at', { ascending: false });

      if (categoryId) {
        query = query.eq('category_id', categoryId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data;
    },
  });

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

  if (!posts?.length) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-muted-foreground">
          Keine Beiträge gefunden
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <Card key={post.id}>
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold">{post.title}</h3>
                <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                  <Badge variant="secondary">
                    {post.team_categories?.name}
                  </Badge>
                  <span>•</span>
                  <span>
                    {formatDistanceToNow(new Date(post.created_at), {
                      addSuffix: true,
                      locale: de,
                    })}
                  </span>
                </div>
              </div>
            </div>
            <p className="mt-4 whitespace-pre-wrap">{post.content}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}